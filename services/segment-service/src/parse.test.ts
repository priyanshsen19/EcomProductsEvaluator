import { parseRules, toMongoFilter } from "./parse";

test("parses and builds filter", () => {
  const cs = parseRules("price > 1000\nstock_status = instock\non_sale = true");
  const f = toMongoFilter(cs);
  expect(f.price.$gt).toBe(1000);
  expect(f.stock_status).toBe("instock");
  expect(f.on_sale).toBe(true);
});
