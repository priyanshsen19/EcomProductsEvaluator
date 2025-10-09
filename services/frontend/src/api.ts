import axios from "axios";
export const productsApi = axios.create({ baseURL: import.meta.env.VITE_PRODUCTS_API });
export const segmentsApi = axios.create({ baseURL: import.meta.env.VITE_SEGMENTS_API });
