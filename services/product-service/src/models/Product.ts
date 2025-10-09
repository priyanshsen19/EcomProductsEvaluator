import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  title: { type: String },
  price: { type: Number },
  stock_status: { type: String },
  stock_quantity: { type: Number, default: null },
  category: { type: String, default: null },
  tags: { type: [String], default: [] },
  on_sale: { type: Boolean },
  created_at: { type: Date }
}, { timestamps: true });

export const Product = model("Product", ProductSchema);
