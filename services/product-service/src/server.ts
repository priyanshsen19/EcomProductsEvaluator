import dotenv from "dotenv";
dotenv.config({ override: false });
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";
import { Product } from "./models/Product";
import { ingestAll } from "./ingest";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of products to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successfully fetched products
 */
app.get("/products", async (req, res) => {
  const { limit = "50", page = "1" } = req.query as any;
  const l = Math.min(parseInt(limit), 100);
  const p = Math.max(parseInt(page), 1);
  const items = await Product.find()
    .sort({ created_at: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();
  res.json({ items, page: p, limit: l });
});

const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service",
      version: "1.0.0",
      description: "API for product ingestion and querying from WooCommerce",
    },
    servers: [
      {
        url:
          process.env.RAILWAY_STATIC_URL ||
          process.env.RENDER_EXTERNAL_URL ||
          "http://localhost:4000",
      },
    ],
  },
  apis: ["./dist/**/*.js", "./src/**/*.ts"],
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/admin/health", (_req, res) => res.json({ ok: true }));

export const connectDB = async () => {
  const mongo = process.env.MONGODB_URI!;
  await mongoose.connect(mongo);
  console.log("Connected to MongoDB");
};

export const startCron = () => {
  return cron.schedule("0 */3 * * *", () =>
    ingestAll(
      process.env.WOO_BASE_URL!,
      process.env.WOO_KEY!,
      process.env.WOO_SECRET!
    ).catch((err) => console.error("ingest error", err))
  );
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();

      if (process.env.ENABLE_BOOTSTRAP_INGEST !== "false") {
        await ingestAll(
          process.env.WOO_BASE_URL!,
          process.env.WOO_KEY!,
          process.env.WOO_SECRET!
        );
      }

      startCron();
      const port = process.env.PORT ? Number(process.env.PORT) : 4000;
      app.listen(port, "0.0.0.0", () =>
        console.log(`Product service listening on port ${port}`)
      );
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

export default app;
