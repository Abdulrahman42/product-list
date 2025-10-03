import { createRouter, createWebHistory } from "vue-router";

import ProductList from "@/pages/ProductList.vue";
import AddProduct from "@/pages/AddProduct.vue";

const routes = [
  {
    path: "/",
    name: "ProductList",
    component: ProductList,
  },
  {
    path: "/add-product",
    name: "AddProduct",
    component: AddProduct,
  },
  {
    path: "/detail-product/:id", 
    name: "DetailProduct",
    component: AddProduct,
    props: true, 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
