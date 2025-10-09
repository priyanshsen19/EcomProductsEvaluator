# Fullstack Woo Segments

Monorepo with three services:
- product-service: WooCommerce ingestion + GET /products
- segment-service: POST /segments/evaluate
- frontend: React UI to browse products and evaluate segments

## Quickstart (Local)

1) Install: Node 20+, npm 10+, Docker (optional), MongoDB Atlas (or local Mongo).
2) Copy envs:
   ```bash
   cp .env.example .env
   cp services/product-service/.env.example services/product-service/.env
   cp services/segment-service/.env.example services/segment-service/.env
   cp services/frontend/.env.example services/frontend/.env
   ```
3) Set `MONGODB_URI` in both backend `.env` files.
4) Run services:
   ```bash
   # Terminal 1
   cd services/product-service && npm i && npm run dev
   # Terminal 2
   cd services/segment-service && npm i && npm run dev
   # Terminal 3
   cd services/frontend && npm i && npm run dev
   ```
5) Open frontend dev URL printed by Vite.

## Docker

```bash
cd infra
docker compose up --build
```

## Deployment

Deploy `product-service` and `segment-service` to Render/Railway/Heroku.
Set env: `MONGODB_URI`, and for product-service also `WOO_BASE_URL`, `WOO_KEY`, `WOO_SECRET`.
Deploy `frontend` to Vercel; set `VITE_PRODUCTS_API` and `VITE_SEGMENTS_API` to the public API URLs.

## API Docs

Swagger UI:
- Product Service: `/docs`
- Segment Service: `/docs`

## Sample Rules

```
price > 1000
stock_status = instock
on_sale = true
category = Rings
tags = diamond
```

## AI Usage Notes

Boilerplate code and scaffolding generated with an Chatgpt assistant; logic reviewed and adjusted to suit the requirements.
