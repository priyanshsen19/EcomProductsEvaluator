import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  id: Number, title: String, price: Number, stock_status: String,
  stock_quantity: Number, category: String, tags: [String],
  on_sale: Boolean, created_at: Date
}, { collection: "products" });

export const Product = model("Product", ProductSchema);
