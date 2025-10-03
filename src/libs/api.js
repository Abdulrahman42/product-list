import axios from "axios";

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZDFlZjU5MjQyYjkyMGEwZjU0YmZjN2IyN2RhM2VhZGEzZDc1ZDkxZTY0MDA5ZDA3Y2UyOGEzMDdjZjE5NGE4MmRhNTdhNjAwZGUzMTM5ZmIiLCJpYXQiOjE3NTMxNjAxMzQuNDQzMTcxLCJuYmYiOjE3NTMxNjAxMzQuNDQzMTc0LCJleHAiOjE4MTYyMzIxMzQuNDMxOTM1LCJzdWIiOiIxNDMiLCJzY29wZXMiOltdfQ.kfUuBOW6NrO4gFt6kIKUHO3y2j1_yzuVahasjl8ZjtA30AKfnFF1Yn1j9bmbC5eT1BNudBW6kgsm5yley3e3cnsOcLHDhbvdZ8NXE42J-0OEYljR0i9zQn1i-qmE3kfjL48S4aWJ3eWwfvBdOpcBoWmrjpbUHWb9HQ-or4OuN23p4r-mvmTkRJQ18cxgA_Wh5h3J1tPwGBKLd6Z6cklyRWy3g97-pITY6oCStnbQs9XoBfGxpRZFIfdZirZG8Txc1odG_IpWjwTwKWMhxFosbLn5mBbIwTJqxHD0lSEXouLB9iO1fPX79uBAd54FXlXLUc_7awuF-D5kzZwK16e47lDJhyCkynsVFWMhJZhdYZAtbpavQF1hJYnuAXJgRgXgEHudNXkLSN4arJ4r5s8MOrYGuhYGB0wcTWBvBYbVf7QOmD4UNsRYUkJ3NB7ZIuwJMdfPHZVSwjDV1R-6RWD4MPW6ugxRqgnB24i_j43NXfrqR9TiEiesgl8gbeqWxzMD9V9lM_OoS-xouFb4QOYOPYRBV1ewue6e4uQ4u_il-Iu8K74krhu3yIKEgF8tdCXwnHCqj8AWe2K5CS0c6DJhjsxqDPk5ael3SQlgm2-l0J9w5ABgu-3JJ9s82hRY0g2wT6dLk1EqZGkuI3HyejS2G1sT7I88D635afRNqPLOubk";

const api = axios.create({
  baseURL: "https://api.sandbox.kasheer.id/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export async function fetchProducts({
  q = "",
  page = 1,
  pageSize = 5,
  status = "null",
} = {}) {
  const body = {
    search: q || undefined, // kata kunci
    page,
    page_count: parseInt(pageSize),
    active: status === "null" ? undefined : status,
  };
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

  const res = await api.post("/v2/management/product/item/list", body);

  const data = res.data.data.data;
  const total = res.data.count_all;
  const totalActive = res.data.count_active;
  const totalNonActive = res.data.count_non_active;

  const normalizedItems = data.map((item) => {
    const variantsRaw = item.variant_item ?? [];
    const variants = (Array.isArray(variantsRaw) ? variantsRaw : []).map(
      (v) => ({
        id: v.id,
        fullName: v.name ?? null,
        sku: v.sku ?? null,
        price: v.price ?? null,
      })
    );
    return {
      id: item.id,
      name: item.name ?? null,
      description: item.description ?? null,
      price: item.price ?? item.sale_price ?? null,
      category: item.category.name,
      updatedAt: item.updated_at ?? item.updatedAt ?? item.modified_at,
      active: item.is_active == 0 ? false : true,
      variants,
      addOns: item.add_on_link_count,
      __raw: item,
    };
  });

  return { items: normalizedItems, total, totalActive, totalNonActive };
}

export async function bulkUpdateProducts(ids = [], status) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("ids required");
  }

  const body = {
    id_barang: ids.join("|"), // "100|101"
    status, // "ON" / "OFF"
  };

  const res = await api.post(
    "/v2/management/product/item/changeitemstatus",
    body
  );
  return res.data ?? res;
}

export async function updateSingleItemStatus(id, active) {
  const statusValue = active ? "ON" : "OFF";
  const body = { id_barang: id, status: statusValue };
  const res = await api.post(
    "/v2/management/product/item/changeitemstatus",
    body
  );
  return res.data ?? res;
}

export async function listCategories() {
  const res = await api.post("/v1/management/product/item/category");
  return res?.data?.data ?? res?.data ?? [];
}

export async function listAddons() {
  const res = await api.post("/v2/management/product/item/addonlist");
  return res?.data?.data ?? res?.data ?? [];
}

export async function createProduct(form) {
  const formData = new FormData();

  if (form.imageFile) {
    formData.append("gambar", form.imageFile);
  }

  const dataBarang = {
    nama_barang: form.name,
    kategori: Number(form.category),
    sku: form.sku,
    barcode: null,
    harga: Number(form.price),
    unit: form.unit,
    deskripsi: form.description || null,
    as_addon: false,
    has_addon: form.addons?.length > 0,
    has_variant: false,
    add_on:
      form.addons?.map((a) => ({
        id: Number(a.id),
        is_active: Boolean(a.active),
      })) ?? [],
  };

  formData.append("data_barang", JSON.stringify(dataBarang));

  const res = await api.post("/v2/management/product/item/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function getProductDetail(id) {
  const body = { id_barang: String(id) };
  const res = await api.post("/v2/management/product/item/detail", body);
  return res.data ?? res;
}
export async function deleteProduct(id) {
  const body = { item: String(id) };
  const res = await api.post("/v2/management/product/item/delete", body);
  return res.data ?? res;
}

export async function updateProduct(form) {
  const formData = new FormData();

  if (form.imageFile) {
    formData.append("gambar", form.imageFile);
  } else if (form.removeImage) {
    formData.append("gambar", "D");
  }

  const dataBarang = {
    id: Number(form.id), 
    nama_barang: form.name,
    kategori: Number(form.category),
    sku: form.sku,
    barcode: null,
    harga: Number(form.price),
    unit: form.unit,
    deskripsi: form.description || null,
    as_addon: false, 
    has_addon:  false,
    has_variant: false,
    variant_remake: false, 
    variant_clear: false, 
    variant_change: false, 
    add_on: form.addons 
      .map((a, i) => ({
        id_add_on_link: a.id,
        is_active: a.active ? 1 : 0,
        status: a.status,
        position: i + 1,
      })) ?? [],
  };

  formData.append("data_barang", JSON.stringify(dataBarang));

  const res = await api.post("/v2/management/product/item/edit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export default api;
