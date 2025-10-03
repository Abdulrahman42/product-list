<script setup >
import { computed, ref, onMounted } from "vue";
import { useProductStore } from "../stores/products";
import { useDebounceFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { NPagination, } from "naive-ui";
import ProductFilter from "../components/ProductFilter.vue";
import ProductTable from "../components/ProductTable.vue";

const router = useRouter();

function goToAdd() {
  router.push({ name: "AddProduct" });
}

function goToDetail(id) {
  router.push({ name: "DetailProduct", params: { id } });
}

const activeTab = ref("null");

const store = useProductStore();
const {
  search,
  page,
  pageSize,
  items,
  total,
  totalActive,
  totalNonActive,
  isAllSelected,
  selected,
} = storeToRefs(store);
const {
  setSingleActive,
  load,
  bulkAction,
  setPage,
  setPageSize,
  setStatusFilter,
  toggleSelect,
} = store;

onMounted(() => load());

const doSearch = useDebounceFn((q) => {
  search.value = q;
  setPage(1);
  load();
}, 350);

function onSearchInput(q) {
  console.log(q);
  doSearch(q);
}

async function onToggleActive(id, v) {
  try {
    await setSingleActive(id, v);
  } catch {
    await load();
  }
}

async function bulkActivate() {
  await bulkAction("activate");
}
async function bulkDeactivate() {
  await bulkAction("deactivate");
}

const showingRange = computed(() => {
  if (!total.value || items.value.length === 0) {
    return "0-0";
  }
  const start = (page.value - 1) * pageSize.value + 1;
  const end = Math.min(start + items.value.length - 1, total.value);
  return `${start}-${end}`;
});


function selectTab(tabId) {
  activeTab.value = tabId;
  setStatusFilter(parseInt(tabId));
}

</script>

<template>
  <main class="min-h-screen px-4 pt-10 w-screen bg-white">
    <div class="mx-auto flex w-full flex-col gap-8">
      <header class="flex gap-6 items-center justify-end">
        <button
          @click="goToAdd"
          class="flex items-center justify-center rounded-lg cursor-pointer bg-[#0B557F] px-5 py-3 h-[41px] text-sm font-semibold text-white transition"
          type="button">
          <span class="text-2xl mr-3 mb-1">+</span>
          Tambah Barang
        </button>
      </header>

      <section
        class="rounded-lg border border-[#E9EBE8] min-h-full bg-white shadow-card-lg backdrop-blur-sm"
        aria-labelledby="product-table-heading">
        <ProductFilter
          :tabs="[
            { id: 'null', label: 'Semua Barang' },
            { id: '1', label: 'Aktif' },
            { id: '0', label: 'Nonaktif' },
          ]"
          :activeTab="activeTab"
          :selectedCount="selected.size"
          :pageSize="pageSize"
          :total="total"
          :totalActive="totalActive"
          :totalNonActive="totalNonActive"
          :perPageOptions="[5, 10, 25, 50, 100]"
          @tab-change="selectTab"
          @search="onSearchInput"
          @page-size-change="setPageSize"
          @bulk-activate="bulkActivate"
          @bulk-deactivate="bulkDeactivate" />
        <div class="overflow-hidden px-6 rounded-lg rounded-t-lg">
          <div class="overflow-x-auto">
            <ProductTable
              :items="items"
              :selectedCount="selected"
              :isAllSelected="isAllSelected"
              @toggle-select="toggleSelect"
              @toggle-active="onToggleActive"
              @go-detail="goToDetail" />
          </div>
        </div>
        <div class="flex justify-between items-center mt-20 bg-white p-4">
          <div class="text-[#5D5C62]">
            Menampilkan {{ showingRange }} dari {{ total }} produk
          </div>
          <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="total"
            @update:page="setPage" />
        </div>
      </section>
    </div>
  </main>
</template>
