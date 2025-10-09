import dotenv from "dotenv";
dotenv.config({ override: false });
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { z } from "zod";
import { Product } from "./models/Product";
import { parseRules, toMongoFilter } from "./parse";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(cors());
app.use(express.json());

const bodySchema = z.object({
  rulesText: z.string().max(5000),
});

/**
 * @openapi
 * /segments/evaluate:
 *   post:
 *     summary: Evaluate segment rules based on filter expressions
 *     tags:
 *       - Segments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rulesText
 *             properties:
 *               rulesText:
 *                 type: string
 *                 description: Multi-line rules such as "price > 1000\\nstock_status = instock"
 *     responses:
 *       200:
 *         description: Returns the MongoDB filter and matching products
 *       400:
 *         description: Validation error or invalid rule format
 */
app.post("/segments/evaluate", async (req, res) => {
  const { rulesText } = bodySchema.parse(req.body);
  try {
    const clauses = parseRules(rulesText);
    const filter = toMongoFilter(clauses);
    const items = await Product.find(filter).limit(200).lean();
    res.json({ filter, count: items.length, items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * @openapi
 * /segments/evaluate:
 *   get:
 *     summary: Simple health/info route for Segment evaluation endpoint
 *     tags:
 *       - Segments
 *     responses:
 *       200:
 *         description: Returns a short info message
 */
app.get("/segments/evaluate", (_req, res) => {
  res.send("Use POST /segments/evaluate with JSON body to evaluate a segment.");
});

const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Segment Service",
      version: "1.0.0",
      description:
        "Service for evaluating dynamic segment rules and generating MongoDB queries.",
    },
    servers: [
      {
        url:
          process.env.RAILWAY_STATIC_URL ||
          process.env.RENDER_EXTERNAL_URL ||
          "http://localhost:5050",
      },
    ],
  },
  apis: ["./dist/**/*.js", "./src/**/*.ts"],
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");
  const port = process.env.PORT ? Number(process.env.PORT) : 5050;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Segment service listening on port ${port}`);
  });
}
main().catch(e => { console.error(e); process.exit(1); });

export default app;