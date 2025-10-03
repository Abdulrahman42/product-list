<script setup>
import { ref } from "vue";
import { formatCurrency, formatDate } from "../libs/formatters";
import { NTag, NSwitch } from "naive-ui";

const props = defineProps({
  items: Array,
  selectedCount: {
    type: Set,
    default: () => new Set()
  },
  isAllSelected: Boolean,
});

const expanded = ref(new Set());

const emit = defineEmits(["toggle-select", "toggle-active", "go-detail"]);

function toggleExpand(id) {
  if (expanded.value.has(id)) expanded.value.delete(id);
  else expanded.value.add(id);
}
function isExpanded(id) {
  return expanded.value.has(id);
}

function toggleSelect(id) {
  emit("toggle-select", id);
}
function goToDetail(id) {
  emit("go-detail", id);
}

function onToggleActive(id, v) {
  emit("toggle-active", id, v);
}

</script>

<template>
  <table
    class="min-w-full table-fixed bg-white border border-[#E9EBE8] px-6 rounded-b-lg">
    <thead>
      <tr
        class="text-left text-[11px] font-semibold bg-[#F3F4F6] rounded-t-lg uppercase tracking-[0.24em] text-[#5D5C62]">
        <th class="w-12 px-6 py-4">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border checked:border-[#5FA521] bg-white accent-[#EEFAD2]"
            :value="isAllSelected" />
        </th>
        <th class="px-6 py-4">Nama Barang</th>
        <th class="px-6 py-4">Harga</th>
        <th class="px-6 py-4">Kategori</th>
        <th class="px-6 py-4">Tanggal Diperbaharui</th>
        <th class="px-6 py-4">Tindakan</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      <template v-for="row in items" :key="row.id">
        <tr class="border-t">
          <td class="p-2 ml-2 text-center">
            <input
              class="h-4 w-4 rounded border checked:border-[#5FA521] bg-white accent-[#EEFAD2]"
              type="checkbox"
              :checked="selectedCount.has(row.id)"
              @change="toggleSelect(row.id)" />
          </td>
          <td class="p-2 flex w-full cursor-pointer">
            <div
              class="w-[50px] h-[50px] border border-[#E9EBE8] bg-[#FAFAFA] rounded-lg mr-2"></div>
            <div
              class="font-medium text-[#0B557F] flex flex-col"
              @click="goToDetail(row.id)">
              <p>{{ row.name }}</p>
              <p class="text-[#949496] text-sm">
                {{ row.description }}
              </p>
            </div>
            <div
              class="ml-1 cursor-pointer h-max"
              v-if="row.variants?.length"
              @click="toggleExpand(row.id)">
              <n-tag :bordered="false" type="warning" size="small">
                <span class="text-[#0B557F] cursor-pointer text-sm font-medium"
                  >{{ row.variants.length }} Varian</span
                >
              </n-tag>
            </div>
            <div
              class="text-sm ml-1 cursor-pointer h-max"
              v-if="row.addOns > 0">
              <n-tag size="small" :bordered="false" type="info">
                <span class="text-sm font-medium">{{ row.addOns }} Add On</span>
              </n-tag>
            </div>
          </td>
          <td
            class="p-2 text-[#5D5C62] cursor-pointer"
            @click="goToDetail(row.id)">
            {{ formatCurrency(row.price) }}
          </td>
          <td
            class="p-2 text-[#5D5C62] cursor-pointer"
            @click="goToDetail(row.id)">
            {{ row.category }}
          </td>
          <td
            class="p-2 text-[#5D5C62] cursor-pointer"
            @click="goToDetail(row.id)">
            {{ formatDate(row.updatedAt) }}
          </td>
          <td class="p-2">
            <n-switch
              :value="row.active"
              @update:value="(v) => onToggleActive(row.id, v)" />
          </td>
        </tr>

        <!-- Expanded row -->
        <tr v-if="isExpanded(row.id)" class="bg-gray-50">
          <td colspan="6" class="p-3">
            <div v-if="row.variants?.length">
              <table class="w-full text-sm min-w-full table-fixed">
                <thead></thead>
                <tbody>
                  <tr v-for="v in row.variants" :key="v.id">
                    <td class="p-2 text-center w-13"></td>
                    <td class="p-2 flex w-full">
                      <div
                        class="w-[50px] h-[50px] border border-[#E9EBE8] bg-[#FAFAFA] rounded-lg mr-2"></div>
                      <div class="font-medium text-[#0B557F] flex flex-col">
                        <p>{{ v.fullName }}</p>
                        <p class="text-[#949496] text-sm">
                          {{ v.sku }}
                        </p>
                      </div>
                      <div
                        class="text-sm text-gray-500 bg-[#EFBB6D66] ml-1 cursor-pointer h-max"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
