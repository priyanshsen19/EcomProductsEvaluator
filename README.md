# Fullstack Woo Segments

Monorepo with three services:  
- **product-service:** WooCommerce ingestion and `GET /products` endpoint  
- **segment-service:** Rule parsing and evaluation via `POST /segments/evaluate`  
- **frontend:** React-based UI to browse products and evaluate dynamic segments  

---

## Quickstart (Local)

1) **Install prerequisites:**  
   Node.js 20+, npm 10+, Docker (optional), MongoDB Atlas (or local MongoDB instance)

2) **Copy environment files:**  
   ```bash
   cp .env.example .env
   cp services/product-service/.env.example services/product-service/.env
   cp services/segment-service/.env.example services/segment-service/.env
   cp services/frontend/.env.example services/frontend/.env
   ```

3) **Set environment variables:**  
   Update `MONGODB_URI` in both backend `.env` files with your MongoDB connection string.  
   Add WooCommerce credentials in `product-service/.env`:
   ```
   WOO_BASE_URL, WOO_KEY, WOO_SECRET
   ```

4) **Run services:**  
   ```bash
   # Terminal 1
   cd services/product-service && npm i && npm run dev
   # Terminal 2
   cd services/segment-service && npm i && npm run dev
   # Terminal 3
   cd services/frontend && npm i && npm run dev
   ```

5) **Access frontend:**  
   Open the Vite development server URL printed in the console (usually http://localhost:5173).

---

## Docker

Run all services (MongoDB, product-service, segment-service, frontend) in containers:

```bash
docker compose up --build
```

### Seed demo products

DummyJSON provides a keyless product feed with categories, tags, stock, and prices.
Disable the unavailable WooCommerce bootstrap import in your root `.env`, then seed MongoDB:

```bash
ENABLE_BOOTSTRAP_INGEST=false
docker compose up -d --build mongo product-service segment-service
docker compose run --rm product-service npm run seed
```

The seed command imports up to 100 products from DummyJSON by default. Set
`SEED_SOURCE_URL` to use another compatible endpoint; if the endpoint cannot be
reached, the command seeds a bundled 12-product fallback dataset instead.

**Default Ports:**  
- Product Service → 4000  
- Segment Service → 5050  
- Frontend → 5173  
- MongoDB → 27017  

---

## Deployment

### Backend (Railway)
- Deployed both **product-service** and **segment-service** on Railway.
- Root directories:
  ```
  services/product-service
  services/segment-service
  ```
- Environment variables set:
  ```
  MONGODB_URI
  WOO_BASE_URL
  WOO_KEY
  WOO_SECRET
  ENABLE_BOOTSTRAP_INGEST=true
  ```
- Start command:  
  ```
  npm start
  ```

**Live APIs:**  
- Product Service → https://product-service-production-bfc7.up.railway.app/docs  
- Segment Service → https://segment-service-production.up.railway.app/docs

### Frontend (Render)
- Deployed as a static site using **Render**.  
- Configuration:
  ```
  Root Directory: services/frontend
  Build Command: npm run build
  Publish Directory: dist
  ```
- Environment variables:
  ```
  VITE_PRODUCTS_API=https://product-service-production-bfc7.up.railway.app
  VITE_SEGMENTS_API=https://segment-service-production.up.railway.app
  ```

**Live Site:**  
https://ecomproductsevaluator.onrender.com

**Demo Link:**
https://bit.ly/3IH1aQy

---

## API Docs

Swagger UI available at:  
- Product Service → https://product-service-production-bfc7.up.railway.app/docs/
- Segment Service → https://segment-service-production.up.railway.app/docs/

Each API includes OpenAPI specification with example request/response structures.

---

## Sample Rules

Example input for segment evaluation:

```
price > 1000
stock_status = instock
on_sale = true
category = Rings
tags = diamond
```

Expected output:

```json
{
  "filter": {
    "price": { "$gt": 1000 },
    "stock_status": "instock",
    "on_sale": true,
    "category": "Rings",
    "tags": "diamond"
  },
  "count": 7,
  "items": [...]
}
```

---

## Cron Ingestion Logic

The **product-service** automatically ingests WooCommerce products into MongoDB.  
It uses `node-cron` to schedule ingestion every 3 hours:

```javascript
cron.schedule("0 */3 * * *", () =>
  ingestAll(process.env.WOO_BASE_URL!, process.env.WOO_KEY!, process.env.WOO_SECRET!)
);
```

This ensures product data is regularly updated for accurate segment evaluation.

---

## AI Usage Notes

The development process leveraged ChatGPT for **structured automation**, debugging, and documentation.  
All application logic, schema design, and code integrations were written and verified manually.  
Below is a detailed breakdown of how AI was utilized:

### Libraries and Tools Integrated with AI Assistance
- **Swagger UI + swagger-jsdoc** → integrated and configured with AI guidance for generating OpenAPI documentation.
- **Zod** → used for schema validation; ChatGPT assisted with syntax and runtime validation pattern setup.
- **node-cron** → implemented cron-based WooCommerce ingestion using examples and adjustments derived from AI.
- **mongoose** → schema definitions and optimized query handling pattern were validated using AI feedback.
- **dotenv, express, cors** → included as foundational boilerplate modules following AI-generated setup templates.

### Boilerplate and Structural Code
- Project folder structure, TypeScript configuration (`tsconfig.json`), and initial Express server boilerplate for both services were scaffolded with ChatGPT assistance.
- Initial Docker and Docker Compose configuration files were generated through AI guidance, later debugged and optimized manually.
- Basic React frontend setup using Vite and configuration of environment variables were derived from AI prompts.

### Deployment and Containerization Assistance
- **Railway Deployment Fixes:** AI helped identify and resolve environment variable conflicts, specifically `PORT` binding issues during deployment. Adjustments were made to dynamically bind to `process.env.PORT` with `"0.0.0.0"` for containerized environments.
- **Render Deployment:** Frontend build and publish configuration were fine-tuned using AI feedback on directory structure (`dist`) and environment variable usage.
- **Docker Issues:** AI assistance was used to fix errors like missing `/app/package.json` in multi-stage builds by restructuring `COPY` commands and build contexts.

### Issues Faced and Resolved via ChatGPT
- **Mongoose Connection Errors:** “ECONNREFUSED 127.0.0.1:27017” fixed by switching from local to MongoDB Atlas URI.
- **TypeScript Module Errors:** “ECMAScript imports cannot be written in a CommonJS file” resolved by adjusting `type` in `package.json` and `tsconfig` module resolution.
- **Axios Network Error in Frontend:** Diagnosed through AI-driven debugging of proxy and CORS configuration; resolved by aligning backend service URLs.
- **Port Binding in Railway:** AI identified that hardcoded ports (4000, 5050) prevented public routing; resolved via dynamic port assignment and removal of local `.env` `PORT` values.

All AI-generated outputs were reviewed, tested, and refined for accuracy, performance, and deployment stability.

---

## Author

**Priyansh Sen**  
Full Stack Developer  
