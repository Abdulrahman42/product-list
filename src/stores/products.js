import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  fetchProducts,
  bulkUpdateProducts,
  updateSingleItemStatus,
} from "@/libs/api";

export const useProductStore = defineStore("products", () => {
  const items = ref([]);
  const total = ref(0);
  const totalActive = ref(0);
  const totalNonActive = ref(0);
  const loading = ref(false);

  const page = ref(1);
  const pageSize = ref(10);
  const search = ref("");
  const statusFilter = ref("null");

  const selected = ref(new Set());

  const isAllSelected = computed({
    get: () =>
      items.value.length > 0 &&
      items.value.every((it) => selected.value.has(it.id)),
    set: (val) => {
      if (val) {
        selected.value = new Set(items.value.map((it) => it.id));
      } else {
        selected.value = new Set();
      }
    },
  });

  async function load() {
    loading.value = true;
    try {
      const {
        items: dataItems,
        total: totalCount,
        totalActive: totalCountActive,
        totalNonActive: totalCountNonActive,
      } = await fetchProducts({
        q: search.value,
        page: page.value,
        pageSize: pageSize.value,
        status: statusFilter.value,
      });
      items.value = dataItems;
      total.value = totalCount;
      totalNonActive.value = totalCountNonActive;
      totalActive.value = totalCountActive;
    } finally {
      loading.value = false;
    }
  }

  function setStatusFilter(s) {
    statusFilter.value = s;
    page.value = 1;
    load();
  }

  function toggleSelect(id) {
    if (selected.value.has(id)) selected.value.delete(id);
    else selected.value.add(id);
  }

  function toggleSelectAll(checked) {
    if (checked) {
      selected.value = new Set(items.value.map((i) => i.id));
    } else {
      selected.value = new Set();
    }
  }

  function clearSelection() {
    selected.value = new Set();
  }

  function setPage(p) {
    page.value = p;
    load();
  }
  function setPageSize(s) {
    pageSize.value = s;
    page.value = 1;
    load();
  }

  async function setSingleActive(id, active) {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx !== -1) items.value[idx].active = active;
    try {
      await updateSingleItemStatus(id, active);
    } catch (err) {
      await load();
      throw err;
    }
  }

  async function bulkAction(action) {
    const ids = Array.from(selected.value);
    if (ids.length === 0) return;

    items.value = items.value.map((it) =>
      ids.includes(it.id) ? { ...it, active: action === "activate" } : it
    );

    const statusValue = action === "activate" ? "ON" : "OFF";
    try {
      await bulkUpdateProducts(ids, statusValue);
      clearSelection();
      await load();
    } catch (err) {
      await load();
      throw err;
    }
  }

  return {
    items,
    total,
    totalActive,
    totalNonActive,
    loading,
    page,
    pageSize,
    search,
    statusFilter,
    selected,
    isAllSelected,
    load,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    setPage,
    setPageSize,
    setSingleActive,
    bulkAction,
    setStatusFilter,
  };
});
