import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "./models/Product";

dotenv.config({ override: false });

const sourceUrl =
  process.env.SEED_SOURCE_URL || "https://dummyjson.com/products?limit=100";

const fallbackProducts = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99, stock: 99, category: "beauty", tags: ["beauty", "mascara"], discountPercentage: 7.17 },
  { id: 2, title: "Eyeshadow Palette with Mirror", price: 19.99, stock: 0, category: "beauty", tags: ["beauty", "palette"], discountPercentage: 0 },
  { id: 3, title: "Powder Canister", price: 14.99, stock: 34, category: "beauty", tags: ["beauty"], discountPercentage: 18.1 },
  { id: 4, title: "Red Lipstick", price: 12.49, stock: 12, category: "beauty", tags: ["beauty", "lipstick"], discountPercentage: 0 },
  { id: 5, title: "Calvin Klein Fragrance", price: 1299, stock: 5, category: "fragrances", tags: ["perfume", "luxury"], discountPercentage: 11.4 },
  { id: 6, title: "Gucci Bloom Perfume", price: 1499.99, stock: 0, category: "fragrances", tags: ["perfume", "luxury"], discountPercentage: 0 },
  { id: 7, title: "Annibale Colombo Sofa", price: 2499.99, stock: 8, category: "furniture", tags: ["furniture", "sofa"], discountPercentage: 15 },
  { id: 8, title: "Wooden Bedside Table", price: 899.5, stock: 20, category: "furniture", tags: ["furniture"], discountPercentage: 0 },
  { id: 9, title: "Apple MacBook Pro 14", price: 1999.99, stock: 15, category: "laptops", tags: ["laptop", "apple"], discountPercentage: 6.2 },
  { id: 10, title: "Asus Zenbook Pro", price: 1499, stock: 0, category: "laptops", tags: ["laptop"], discountPercentage: 0 },
  { id: 11, title: "iPhone 15 Pro", price: 1199, stock: 40, category: "smartphones", tags: ["phone", "apple"], discountPercentage: 8 },
  { id: 12, title: "Samsung Galaxy S24", price: 999.99, stock: 25, category: "smartphones", tags: ["phone", "android"], discountPercentage: 0 },
];

type SourceProduct = (typeof fallbackProducts)[number] & {
  meta?: { createdAt?: string };
};

function mapProduct(product: SourceProduct) {
  const stock = typeof product.stock === "number" ? product.stock : 0;

  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    stock_status: stock > 0 ? "instock" : "outofstock",
    stock_quantity: stock,
    category: product.category ?? null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    on_sale: (product.discountPercentage ?? 0) > 0,
    created_at: product.meta?.createdAt
      ? new Date(product.meta.createdAt)
      : new Date(),
  };
}

async function getProducts(): Promise<SourceProduct[]> {
  try {
    const { data } = await axios.get<{ products?: SourceProduct[] } | SourceProduct[]>(
      sourceUrl,
      { timeout: 20_000 }
    );
    const products = Array.isArray(data) ? data : data.products;

    if (!products?.length) {
      throw new Error("The data source returned no products");
    }

    console.log(`Fetched ${products.length} products from ${sourceUrl}`);
    return products;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Source unavailable (${message}); using built-in fallback data.`);
    return fallbackProducts;
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  try {
    const products = await getProducts();
    await Product.bulkWrite(
      products.map((product) => {
        const document = mapProduct(product);
        return {
          updateOne: {
            filter: { id: document.id },
            update: { $set: document },
            upsert: true,
          },
        };
      })
    );
    console.log(`Seeded ${products.length} products`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
