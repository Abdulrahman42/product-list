<script setup>
import {
  ChevronDownOutline,
  TrashOutline,
  ChevronUpOutline,
  ArrowBackSharp,
} from "@vicons/ionicons5";
import { ref, reactive, computed, onMounted } from "vue";
import { NSwitch, NIcon } from "naive-ui";
import {
  listCategories,
  listAddons,
  createProduct,
  getProductDetail,
  deleteProduct,
  updateProduct,
} from "@/libs/api";
import { useRouter } from "vue-router";
const router = useRouter();

let originalForm = null;
let originalAddons = null;

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const form = reactive({
  id: "",
  name: "",
  description: "",
  category: "",
  price: null,
  sku: "",
  unit: "",
  imageFile: null,
  addons: [],
});

const categories = ref([]);
const addons = ref([]);
const selectedAddons = ref([]);
const addonPicker = ref("");
const previewUrl = ref(null);
const fileInput = ref(null);
const submitting = ref(false);
const showMaxToast = ref(false);
const showDescription = ref(false);

const isFormValid = computed(() => {
  return (
    String(form.name || "").trim() !== "" &&
    form.category !== "" &&
    form.category !== null &&
    typeof form.price === "number" &&
    form.price > 0 &&
    String(form.sku || "").trim() !== "" &&
    String(form.unit || "").trim() !== ""
  );
});

const isChanged = computed(() => {
  return (
    JSON.stringify(form) !== JSON.stringify(originalForm) ||
    JSON.stringify(selectedAddons.value) !== JSON.stringify(originalAddons)
  );
});

function goToAdd() {
  router.push({ name: "ProductList" });
}

const pageTitle = computed(() => {
  return props.id ? form.name || "Detail Produk" : "Tambah Barang Baru";
});

const canAddAddon = computed(() => {
  return (
    addonPicker.value &&
    !isAddonAdded(addonPicker.value) &&
    selectedAddons.value.length < 5
  );
});

function isAddonAdded(id) {
  return selectedAddons.value.some((a) => String(a.id) === String(id));
}

async function loadLists() {
  try {
    const cats = await listCategories();
    categories.value = Array.isArray(cats) ? cats : [];
  } catch (e) {
    console.error("Failed to load categories", e);
    categories.value = [];
  }

  try {
    const ads = await listAddons();
    addons.value = Array.isArray(ads) ? ads : [];
  } catch (e) {
    console.error("Failed to load addons", e);
    addons.value = [];
  }
}

function toggleExpand() {
  showDescription.value = !showDescription.value;
}

function triggerFile() {
  if (fileInput.value) fileInput.value.click();
}

function onFileChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  // validation: type and size
  const allowed = ["image/png", "image/jpeg"];
  if (!allowed.includes(f.type)) {
    alert("Format file harus .png atau .jpg");
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    alert("Ukuran file maksimal 2MB");
    return;
  }
  form.imageFile = f;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(f);
}

function removeImage() {
  form.imageFile = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  if (fileInput.value) fileInput.value.value = null;
}

function addAddon() {
  if (!addonPicker.value) return;
  if (selectedAddons.value.length >= 5) return;

  const raw = addons.value.find(
    (a) => String(a.id) === String(addonPicker.value)
  );
  if (!raw) return;

  const deleted = selectedAddons.value.find(
    (a) => a.id === raw.id && a.status === "D"
  );
  if (deleted) {
    deleted.status = "N";
    return;
  }
  selectedAddons.value.push({
    id: raw.id,
    name: raw.name,
    active: true,
    add_on_item_count: raw.add_on_item_count || 0,
    position: selectedAddons.value.length + 1,
    status: "A",
  });
  addonPicker.value = "";
}

function toggleAddon(id, value) {
  const addon = selectedAddons.value.find((a) => a.id === id);
  if (!addon) return;
  addon.active = value;

  if (addon.status !== "A") addon.status = "E";
}

function removeAddon(id) {
  const addon = selectedAddons.value.find((a) => a.id === id);
  if (!addon) return;
  addon.status = "D";
}

function onCancel() {
  if (confirm("Batal penambahan produk? Semua isian akan hilang.")) {
    form.name = "";
    form.description = "";
    form.category = "";
    form.price = null;
    form.sku = "";
    form.unit = "";
    removeImage();
    selectedAddons.value = [];
  }
  router.push({ name: "ProductList" });
}

async function onSubmit() {
  if (!isFormValid.value) {
    alert("Isi semua field wajib terlebih dahulu.");
    return;
  }
  submitting.value = true;
  try {
    const res = props.id
      ? await updateProduct({ ...form, addons: selectedAddons.value })
      : await createProduct({ ...form, addons: selectedAddons.value });

    alert("Produk berhasil dibuat!");
    if (!props.id) {
      resetForm();
    }
  } catch (err) {
    console.error("Gagal menyimpan produk:", err.response?.data || err);
    alert("Gagal menyimpan produk. Cek console untuk detail.");
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.name = "";
  form.description = "";
  form.category = "";
  form.price = null;
  form.sku = "";
  form.unit = "";
  removeImage();
  selectedAddons.value = [];
}

async function onDelete() {
  if (!props.id) return;
  try {
    const res = await deleteProduct(props.id);
    router.push({ name: "ProductList" });
  } catch (error) {
    console.error(error);
    alert("Gagal menghapus produk. Cek console untuk detail.");
  }
}
const baseUrl = "https://api.sandbox.kasheer.id/storage/";
onMounted(async () => {
  loadLists();
  if (props.id) {
    try {
      const res = await getProductDetail(props.id);
      form.id = res.data.id;
      form.name = res.data.name;
      form.description = res.data.description;
      form.category = res.data.category?.id ?? "";
      form.price = res.data.price;
      form.sku = res.data.sku;
      form.unit = res.data.unit;
      selectedAddons.value = (res.data.add_on_link ?? []).map((a) => ({
        id: a.id,
        name: a.add_on_group.name,
        active: a.is_active ? true : false,
        add_on_item_count: a.add_on_group.add_on_item_count ?? 0,
        position: a.position ?? i + 1,
        status: "N",
      }));
      form.imageFile = res.data.image;
      originalForm = JSON.parse(JSON.stringify(form));
      originalAddons = JSON.parse(JSON.stringify(selectedAddons.value));
    } catch (err) {
      console.error("Gagal load detail produk", err);
    }
  }
});
</script>
<template>
  <div>
    <div class="min-h-screen px-4 py-10 bg-[#FAFAFA]">
      <h2
        class="text-lg font-semibold text-[#5D5C62] mb-4 cursor-pointer flex items-center gap-4"
        @click="goToAdd">
        <n-icon size="20"> <ArrowBackSharp /> </n-icon>
        {{ pageTitle }}
      </h2>

      <!-- Info Barang -->
      <section class="mb-6 rounded-md border border-[#E9EBE8] p-4 bg-white">
        <label class="block mb-1 text-[#5D5C62] text-base font-bold"
          >Info Barang</label
        >
        <label class="block mb-1 text-[#737278] font-semibold text-sm"
          >Nama Barang <span class="text-red-500">*</span></label
        >
        <input
          v-model="form.name"
          type="text"
          placeholder="Contoh: Ayam Goreng"
          class="w-full rounded px-3 py-2 border text-[#5D5C62] border-[#E9EBE8] placeholder:text-[#BDBDBD]" />

        <div class="flex items-center justify-between mt-4 mb-1">
          <label class="block text-[#737278] font-semibold text-sm"
            >Deskripsi (optional)</label
          >
          <button
            class="text-[#737278] cursor-pointer text-center"
            @click="toggleExpand">
            <n-icon size="20">
              <component
                :is="showDescription ? ChevronUpOutline : ChevronDownOutline" />
            </n-icon>
          </button>
        </div>
        <textarea
          v-if="showDescription"
          v-model="form.description"
          rows="3"
          placeholder="Deskripsi..."
          class="w-full rounded px-3 py-2 border text-[#5D5C62] border-[#E9EBE8]"></textarea>
        <div class="border-b border-b-[#E9EBE8] my-5 -mx-4"></div>
        <label class="block mb-1 text-[#5D5C62] text-base font-bold"
          >Organisasi Barang</label
        >
        <label class="block mb-1 text-[#737278] font-semibold text-sm"
          >Kategori Barang <span class="text-red-500">*</span></label
        >
        <select
          v-model="form.category"
          class="w-full text-[#5D5C62] rounded px-3 py-2 placeholder:text-[#BDBDBD] border border-[#E9EBE8]">
          <option value="" disabled selected hidden class="text-red-300">
            Contoh: Makanan, Handphone
          </option>

          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
            class="text-[#5D5C62]">
            {{ c.name }}
          </option>
        </select>

        <div class="mt-4">
          <label class="block mb-1 text-[#737278] font-semibold text-sm"
            >Foto Barang</label
          >
          <div
            class="flex items-end justify-between h-[131px] border border-[#E9EBE8] p-4 rounded-md">
            <div class="flex items-start">
              <div v-if="previewUrl">
                <img
                  :src="previewUrl"
                  class="w-[100px] h-[100px] object-cover rounded border"
                  alt="preview" />
              </div>
              <div v-else-if="form.imageFile" class="rounded-md">
                <img
                  :src="baseUrl + form.imageFile"
                  class="w-[100px] h-[100px] object-cover rounded border"
                  alt="preview" />
              </div>
              <div
                v-else
                class="w-[100px] h-[100px] bg-[#FAFAFA] border-dashed border border-[#DFDFE1] rounded-md"></div>
              <div class="flex flex-col ml-4">
                <label class="text-sm font-semibold text-[#5D5C62]"
                  >Unggah foto</label
                >
                <label class="text-xs font-normal text-[#949496]"
                  >Format .png & .jpg up to 10MB</label
                >
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/png, image/jpeg"
              @change="onFileChange" />
            <button
              class="bg-[#0B557F] text-white px-3 py-1 rounded-md cursor-pointer"
              @click="triggerFile">
              Unggah Foto
            </button>
          </div>
        </div>
      </section>

      <!-- Harga -->
      <section class="mb-6 border border-[#E9EBE8] rounded-md p-4 bg-white">
        <label class="block mb-1 text-[#5D5C62] text-base font-bold"
          >Harga</label
        >
        <label class="block mb-1 text-[#5D5C62] font-semibold text-sm"
          >Harga <span class="text-red-500">*</span></label
        >
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          placeholder="Rp 0"
          class="w-full rounded px-3 py-2 border text-[#5D5C62] border-[#E9EBE8] placeholder:text-[#BDBDBD]" />
      </section>

      <!-- Detail Barang -->
      <section class="mb-6 border border-[#E9EBE8] rounded-md p-4 bg-white">
        <label class="block mb-1 text-[#5D5C62] text-base font-bold"
          >Detail Barang</label
        >
        <label class="block mb-1 text-[#737278] text-sm font-medium"
          >Pilih tipe barang yang sesuai dengan barang Anda</label
        >
        <div class="border-b border-b-[#E9EBE8] my-5 -mx-4"></div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1 text-[#737278] font-semibold text-sm"
              >Kode Barang (SKU) <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.sku"
              placeholder="Contoh: AG001"
              class="w-full rounded px-3 py-2 border text-[#5D5C62] border-[#E9EBE8] placeholder:text-[#BDBDBD]" />
          </div>
          <div>
            <label class="block mb-1 text-[#737278] font-semibold text-sm"
              >Unit Barang <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.unit"
              placeholder="Contoh: kg, pcs, unit"
              class="w-full rounded px-3 py-2 border text-[#5D5C62] border-[#E9EBE8] placeholder:text-[#BDBDBD]" />
          </div>
        </div>
      </section>

      <!-- Add On -->
      <section class="mb-6 border border-[#E9EBE8] rounded-md p-4 bg-white">
        <div class="flex justify-between">
          <div>
            <label class="block mb-1 text-[#5D5C62] text-base font-bold"
              >Add On</label
            >
            <label class="block mb-5 text-[#737278] text-sm font-medium"
              >Tambahkan Add On pada barang Anda</label
            >
          </div>
          <label
            v-if="selectedAddons.length > 0"
            class="block mb-5 text-[#737278] text-sm font-medium"
            >Limit Penambahan Add On ({{ selectedAddons.length }}/5)</label
          >
        </div>

        <label class="block mb-1 text-[#737278] font-semibold text-sm"
          >Pilih Add On</label
        >
        <div class="flex gap-3 mt-3 items-center w-auto">
          <select
            v-model="addonPicker"
            :disabled="selectedAddons.length >= 5"
            class="rounded px-3 py-2 text-[#5D5C62] placeholder:text-[#BDBDBD] border border-[#E9EBE8] w-full">
            <option value="" disabled selected hidden>
              -- Pilih Add On --
            </option>
            <option
              class="text-[#5D5C62]"
              v-for="a in addons"
              :key="a.id"
              :value="a.id"
              :disabled="isAddonAdded(a.id)">
              {{ a.name }}
            </option>
          </select>
          <button
            class="bg-[#0B557F] disabled:bg-[#B5E4FF] text-white cursor-pointer disabled:cursor-not-allowed rounded px-3 py-1 w-[120px] h-[37px]"
            :disabled="!canAddAddon"
            @click="addAddon">
            + Tambah
          </button>
        </div>

        <div v-if="showMaxToast" class="text-sm text-red-600 mt-2">
          Maksimal 5 Add On
        </div>

        <!-- Table Add On -->
        <div
          v-if="selectedAddons.length > 0"
          class="mt-4 border rounded overflow-hidden">
          <table
            class="w-full text-sm border border-[#E9EBE8] px-6 rounded-b-lg">
            <thead class="bg-[#FAFAFA] text-[#5D5C62]">
              <tr>
                <th class="p-2 text-left">Add On</th>
                <th class="p-2 text-right w-32">Status</th>
                <th class="p-2 text-right w-32">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(a, idx) in selectedAddons"
                :key="idx"
                class="border-t">
                <td class="p-2">
                  <div class="flex">
                    <span class="text-[#0B557F] font-bold">
                      {{ a.name }}
                    </span>
                    <div
                      class="text-xs ml-2 p-1"
                      :class="
                        a.active
                          ? 'bg-[#EEFAD266] text-[#5FA521]' // hijau kalau aktif
                          : 'bg-red-100 text-red-600' // merah kalau nonaktif
                      ">
                      {{ a.active ? "Aktif" : "NonAktif" }}
                    </div>
                  </div>
                  <div class="text-[#949496] text-sm font-normal">
                    {{ a.add_on_item_count }} Pilihan
                  </div>
                </td>
                <td class="p-2 text-right w-32">
                  <n-switch
                    :value="a.active"
                    @update:value="(v) => toggleAddon(a.id, v)" />
                </td>
                <td class="p-2 text-right w-32">
                  <button
                    class="text-red-600 cursor-pointer text-center"
                    @click="removeAddon(a.id)">
                    <n-icon size="20">
                      <TrashOutline />
                    </n-icon>
                  </button>
                </td>
              </tr>
              <tr v-if="selectedAddons.length === 0">
                <td colspan="4" class="p-4 text-center text-gray-500">
                  Belum ada Add On ditambahkan
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Action Buttons -->
    </div>
    <div
      class="flex w-full bg-white p-4 border-t border-[#E9EBE8]"
      :class="[
        pageTitle === 'Tambah Barang Baru' ? 'justify-end' : 'justify-between',
      ]">
      <div v-if="pageTitle != 'Tambah Barang Baru'">
        <button
          class="text-red-600 cursor-pointer text-center flex items-center gap-2"
          @click="onDelete">
          <n-icon size="20"> <TrashOutline /> </n-icon>Hapus Barang
        </button>
      </div>
      <div>
        <button
          class="px-4 py-2 w-[224px] bg-[#F6F6F9] text-[#BDBDBD] mr-4 rounded-md cursor-pointer"
          @click="onCancel">
          Batal
        </button>
        <button
          class="px-4 py-2 bg-[#0B557F] disabled:bg-[#B5E4FF] disabled:cursor-default cursor-pointer w-[224px] text-white rounded-md"
          :disabled="!isFormValid || !isChanged || submitting"
          @click="onSubmit">
          <span v-if="submitting">Menyimpan...</span>
          <span v-else>Simpan</span>
        </button>
      </div>
    </div>
  </div>
</template>
