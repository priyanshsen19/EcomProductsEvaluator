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

const bodySchema = z.object({ rulesText: z.string().max(5000) });

/**
 * @openapi
 * /segments/evaluate:
 *   post:
 *     summary: Evaluate segment rules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rulesText:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
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

app.get("/segments/evaluate", (_req, res) => {
  res.send("Use POST /segments/evaluate with JSON body to evaluate a segment.");
});

const specs = swaggerJsdoc({
  definition: { openapi: "3.0.0", info: { title: "Segment Service", version: "1.0.0" } },
  apis: ["./src/server.ts"]
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const port = process.env.PORT ? Number(process.env.PORT) : 5050;
  app.listen(port, () => console.log(`Listening on port ${port}`));
}
main().catch(e => { console.error(e); process.exit(1); });
