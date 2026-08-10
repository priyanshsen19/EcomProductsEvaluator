import axios from "axios";

// Free Render services can take around a minute to wake after they have idled.
const timeout = 75_000;

export const productsApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API || "http://localhost:4000",
  timeout,
});

export const segmentsApi = axios.create({
  baseURL: import.meta.env.VITE_SEGMENTS_API || "http://localhost:5050",
  timeout,
});
