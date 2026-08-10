import axios from "axios";

const timeout = 10_000;

export const productsApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API || "http://localhost:4000",
  timeout,
});

export const segmentsApi = axios.create({
  baseURL: import.meta.env.VITE_SEGMENTS_API || "http://localhost:5050",
  timeout,
});
