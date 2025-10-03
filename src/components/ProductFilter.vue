<script setup>
import { ref, computed } from "vue";
import { NIcon } from "naive-ui";
import { ChevronDownOutline, SearchOutline } from "@vicons/ionicons5";

const props = defineProps({
  tabs: Array,
  activeTab: String,
  selectedCount: Number,
  pageSize: Number,
  perPageOptions: Array,
  total: Number,
  totalActive: Number,
  totalNonActive: Number,
});

const emit = defineEmits([
  "tab-change",
  "search",
  "page-size-change",
  "bulk-activate",
  "bulk-deactivate",
]);

const searchTerm = ref("");
const hasSelected = computed(() => props.selectedCount > 0);

function onSearchInput() {
  emit("search", searchTerm.value);
}

function selectTab(tabId) {
  emit("tab-change", tabId);
}

function changePageSize(e) {
  emit("page-size-change", Number(e.target.value));
}

const filteredCount = (tabId) => {
  if (tabId === "null") return props.total;
  if (tabId === "1") return props.totalActive;
  if (tabId === "0") return props.totalNonActive;
  return 0;
};
</script>

<template>
  <div class="flex gap-4 border-b px-6 pb-2 pt-6 items-center justify-between">
    <div v-if="hasSelected" class="flex items-center gap-4">
      <p class="text-[#5D5C62]">{{ selectedCount }} Produk dipilih</p>
      <button
        @click="$emit('bulk-deactivate')"
        class="text-[#5991F2] font-semibold cursor-pointer">
        Nonaktifkan
      </button>
      <button
        @click="$emit('bulk-activate')"
        class="text-[#5991F2] font-semibold cursor-pointer">
        Aktifkan
      </button>
    </div>
    <div
      v-else
      class="flex flex-wrap items-center gap-2 h-[41px] bg-[#FAFAFA] rounded-lg w-[358px] border border-[#E9EBE8]">
      <div class="flex flex-wrap justify-between items-center w-full">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :aria-pressed="activeTab === tab.id"
          @click="selectTab(tab.id)"
          class="h-[32px] text-sm font-semibold transition mx-1 cursor-pointer"
          :class="[
            activeTab === tab.id
              ? 'bg-white text-[#0B557F] rounded-lg shadow-sm px-1 w-max'
              : 'text-[#BDBDBD]',
          ]"
          type="button">
          {{ tab.label }}
          <span
            class="text-[#5D5C62] border border-[#E9EBE8] bg-transparent text-xs rounded-lg p-1"
            >{{ filteredCount(tab.id) }}</span
          >
        </button>
      </div>
    </div>

    <div class="flex w-auto items-center gap-4">
      <label class="flex items-center gap-3 text-sm font-medium text-[#949496]">
        Tampilkan
        <span class="relative inline-flex items-center">
          <select
            :value="pageSize"
            @change="changePageSize"
            class="appearance-none rounded-lg border border-[#E9EBE8] px-4 py-2 pr-10 text-sm font-semibold transition">
            <option
              v-for="option in perPageOptions"
              :key="option"
              :value="option">
              {{ option }}
            </option>
          </select>
          <div
            class="text-[#0B557F] pointer-events-none top-4.5 absolute right-4 h-3 w-3 -translate-y-1/2">
            <n-icon size="14"> <ChevronDownOutline /> </n-icon>
          </div>
        </span>
      </label>
      <div class="relative w-64">
        <div
          class="text-[#0B557F] pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
          <n-icon size="18"> <SearchOutline /> </n-icon>
        </div>
        <input
          @input="onSearchInput"
          v-model="searchTerm"
          type="search"
          placeholder="Cari barang"
          class="w-full rounded-lg border border-[#E9EBE8] text-[#5D5C62] py-2 pl-10 pr-4 text-sm font-medium text-text-base placeholder:text-[#5D5C62]/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
      </div>
    </div>
  </div>
</template>
