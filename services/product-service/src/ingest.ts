import axios from "axios";
import { Product } from "./models/Product";

const map = (p: any) => ({
  id: p.id,
  title: p.name,
  price: p.price ? parseFloat(p.price) : 0,
  stock_status: p.stock_status,
  stock_quantity: p.stock_quantity ?? null,
  category: p.categories?.[0]?.name ?? null,
  tags: (p.tags ?? []).map((t: any) => t.name),
  on_sale: !!p.on_sale,
  created_at: p.date_created
});

export async function ingestAll(base: string, key: string, secret: string) {
  let page = 1;
  while (true) {
    const { data } = await axios.get(`${base}/wp-json/wc/v3/products`, {
      params: { consumer_key: key, consumer_secret: secret, per_page: 100, page },
      timeout: 20000
    });
    if (!Array.isArray(data) || data.length === 0) break;
    const ops = data.map((p: any) => {
      const doc = map(p);
      return Product.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
    });
    await Promise.all(ops);
    page += 1;
  }
}
