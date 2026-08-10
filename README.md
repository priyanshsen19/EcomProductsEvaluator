# Product Segment Explorer

Monorepo with three services:  
- **product-service:** DummyJSON product seeding and `GET /products` endpoint
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
   For the local demo, disable the legacy WooCommerce import:
   ```
   ENABLE_BOOTSTRAP_INGEST=false
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

## Deployment on Render

`render.yaml` defines three free Render web services: `product-service`,
`segment-service`, and `frontend`. Connect this GitHub repository in the
Render Dashboard and select **New → Blueprint** to create or sync them.

Render's free tier does not provide a persistent MongoDB service. Create a free
MongoDB Atlas cluster, then provide its connection string as `MONGODB_URI` for
both backend services when Render prompts for the Blueprint secrets. Allow
network access from Render in Atlas before the first deploy.

The product service runs `npm run seed` after its first successful deploy,
loading DummyJSON products (or its bundled fallback dataset if DummyJSON is
unavailable). The frontend is built with the two Render API URLs from the
Blueprint.

Free Render web services spin down after 15 minutes without traffic, so the
first request after idle can take about a minute.

---

## API Docs

Swagger UI is available at:

- `https://product-service.onrender.com/docs/`
- `https://segment-service.onrender.com/docs/`

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

## Data source

The demo seeds product data from `https://dummyjson.com/products`, a keyless
public API. Its categories, tags, stock quantities, and discount percentages
map directly to the product and segmentation schema. The legacy WooCommerce
ingestion remains available but is disabled for the demo deployment.

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
- **Render Deployment:** AI helped configure the Render Blueprint, Docker build-time frontend variables, and health checks.
- **Docker Issues:** AI assistance was used to fix errors like missing `/app/package.json` in multi-stage builds by restructuring `COPY` commands and build contexts.

### Issues Faced and Resolved via ChatGPT
- **Mongoose Connection Errors:** “ECONNREFUSED 127.0.0.1:27017” fixed by switching from local to MongoDB Atlas URI.
- **TypeScript Module Errors:** “ECMAScript imports cannot be written in a CommonJS file” resolved by adjusting `type` in `package.json` and `tsconfig` module resolution.
- **Axios Network Error in Frontend:** Diagnosed through AI-driven debugging of proxy and CORS configuration; resolved by aligning backend service URLs.
- **Port Binding:** AI identified that hardcoded ports prevented public routing; resolved via dynamic port assignment and `0.0.0.0` bindings.

All AI-generated outputs were reviewed, tested, and refined for accuracy, performance, and deployment stability.

---

## Author

**Priyansh Sen**  
Full Stack Developer  
