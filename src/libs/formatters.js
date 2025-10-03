export function formatCurrency(v) {
  if (v == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(v);
}

export function formatDate(d){
  if (!d) return "-";
  return new Date(d).toLocaleString("id-ID");
}
