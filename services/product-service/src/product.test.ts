import mongoose from "mongoose";
import request from "supertest";
import app, { connectDB } from "./server";

beforeAll(async () => {
  process.env.MONGODB_URI;
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

test("GET /products returns 200", async () => {
  const res = await request(app).get("/products");
  expect(res.status).toBe(200);
}, 20000);
