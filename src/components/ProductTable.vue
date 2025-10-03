<script setup>
import { h, ref } from "vue";
import { NDataTable, NCheckbox, NSwitch, NTag } from "naive-ui";
import { formatCurrency, formatDate } from "../libs/formatters";

const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedCount: {
    type: Set,
    default: () => new Set(),
  },
  isAllSelected: Boolean,
});

const emit = defineEmits([
  "toggle-select",
  "toggle-active",
  "go-detail",
  "toggle-select-all",
]);

const baseUrl = "https://api.sandbox.kasheer.id/storage/";

const expandedRowKeys = ref([]);

function toggleExpand(id) {
  if (expandedRowKeys.value.includes(id)) {
    expandedRowKeys.value = expandedRowKeys.value.filter((k) => k !== id);
  } else {
    expandedRowKeys.value = [...expandedRowKeys.value, id];
  }
}

function toggleSelect(id) {
  emit("toggle-select", id);
}
function toggleSelectAll(checked) {
  emit("toggle-select-all", checked);
}
function goToDetail(id) {
  emit("go-detail", id);
}

function onToggleActive(id, v) {
  emit("toggle-active", id, v);
}

const columns = [
  {
    title: () =>
      h(NCheckbox, {
        checked: props.isAllSelected,
        "onUpdate:checked": (val) => toggleSelectAll(val),
      }),
    key: "checkbox",
    width: 50,
    render: (row) =>
      h(NCheckbox, {
        checked: props.selectedCount.has(row.id),
        "onUpdate:checked": () => toggleSelect(row.id),
      }),
  },
  {
    title: "Nama Barang",
    key: "name",
    render: (row) =>
      h("div", { class: "flex items-center cursor-pointer" }, [
        row.image
          ? h("img", {
              src: baseUrl + row.image,
              class:
                "w-[50px] h-[50px] border border-[#E9EBE8] rounded-lg mr-2 object-cover",
            })
          : h("div", {
              class:
                "w-[50px] h-[50px] border border-[#E9EBE8] bg-[#FAFAFA] rounded-lg mr-2",
            }),
        h(
          "div",
          {
            class: "flex flex-col font-medium text-[#0B557F]",
            onClick: () => goToDetail(row.id),
          },
          [
            h("p", row.name),
            h("p", { class: "text-[#949496] text-sm" }, row.description),
          ]
        ),
        row.variants?.length
          ? h(
              NTag,
              {
                bordered: false,
                type: "warning",
                size: "small",
                class: "ml-2 cursor-pointer",
                onClick: () => toggleExpand(row.id),
              },
              { default: () => `${row.variants.length} Varian` }
            )
          : null,
        row.addOns > 0
          ? h(
              NTag,
              { size: "small", bordered: false, type: "info", class: "ml-1" },
              { default: () => `${row.addOns} Add On` }
            )
          : null,
      ]),
  },
  {
    title: "Harga",
    key: "price",
    render: (row) =>
      h(
        "span",
        {
          class: "cursor-pointer text-[#5D5C62]",
          onClick: () => goToDetail(row.id),
        },
        formatCurrency(row.price)
      ),
  },
  {
    title: "Kategori",
    key: "category",
    render: (row) =>
      h(
        "span",
        {
          class: "cursor-pointer text-[#5D5C62]",
          onClick: () => goToDetail(row.id),
        },
        row.category
      ),
  },
  {
    title: "Tanggal Diperbaharui",
    key: "updatedAt",
    render: (row) =>
      h(
        "span",
        {
          class: "cursor-pointer text-[#5D5C62]",
          onClick: () => goToDetail(row.id),
        },
        formatDate(row.updatedAt)
      ),
  },
  {
    title: "Tindakan",
    key: "actions",
    render: (row) =>
      h(NSwitch, {
        value: row.active,
        "onUpdate:value": (v) => onToggleActive(row.id, v),
      }),
  },
];

const renderExpand = (row) => {
  if (!row.variants?.length) return null;
  return h(
    "table",
    { class: "w-full text-sm table-fixed" },
    row.variants.map((v) =>
      h("tr", { key: v.id }, [
        h("td", { class: "w-12" }),
        h("td", { class: "flex p-2" }, [
          h("div", {
            class:
              "w-[50px] h-[50px] border border-[#E9EBE8] bg-[#FAFAFA] rounded-lg mr-2",
          }),
          h("div", { class: "flex flex-col font-medium text-[#0B557F]" }, [
            h("p", v.fullName),
            h("p", { class: "text-[#949496] text-sm" }, v.sku),
          ]),
        ]),
      ])
    )
  );
};

</script>

<template>
  <n-data-table
    :columns="columns"
    :data="props.items"
    :bordered="true"
    :single-line="false"
    :expanded-row-keys="expandedRowKeys"
    :render-expand="renderExpand"
    @update:expanded-row-keys="keys => expandedRowKeys = keys"
  />
</template>

<style scoped>
:deep(.n-data-table .n-data-table-tbody .n-data-table-tr) {
  border-bottom: none !important;
}
</style>
