import { useEffect, useState } from "react";
import { productsApi, segmentsApi } from "./api";
import ProductCard from "./ProductCard";

export default function App() {
  const [items, setItems] = useState<any[]>([]);
  const [rules, setRules] = useState<string>("price > 1000\nstock_status = instock\non_sale = true");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productsApi.get("/products").then(r => setItems(r.data.items));
  }, []);

  const evaluate = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await segmentsApi.post("/segments/evaluate", { rulesText: rules });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  const resetRules = () => {
    setRules("");
    setResult(null);
    setError(null);
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f9fafb",
      padding: "40px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 24 }}>Woo Segments Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
        alignItems: "start"
      }}>
        {/* Left: Products */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Products</h2>
          <div style={{
            display: "grid",
            gap: 16,
            maxHeight: "80vh",
            overflowY: "auto",
            paddingRight: 8
          }}>
            {items.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* Right: Segment Editor */}
        <section style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Define Filter Conditions</h2>

          <label style={{ fontSize: 14, color: "#555" }}>Enter filter rules (one per line):</label>
          <textarea
            value={rules}
            onChange={e => setRules(e.target.value)}
            rows={10}
            placeholder={"price > 5000\ncategory = Smartphones\nstock_status = instock\nbrand != Samsung\nrating >= 4.0"}
            style={{
              width: "100%",
              fontFamily: "monospace",
              marginTop: 8,
              marginBottom: 16,
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "#f9fafb",
              fontSize: 14,
              resize: "vertical"
            }}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={evaluate}
              disabled={loading}
              style={{
                flex: "0 0 auto",
                background: "#111827",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              {loading ? "Evaluating..." : "Evaluate Filter"}
            </button>

            <button
              onClick={resetRules}
              style={{
                flex: "0 0 auto",
                background: "#e5e7eb",
                color: "#111827",
                border: "none",
                padding: "10px 18px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Reset
            </button>
          </div>

          {/* Example component */}
          <div style={{
            background: "#f3f4f6",
            borderRadius: 8,
            padding: 12,
            marginTop: 24,
            fontSize: 14,
            color: "#374151"
          }}>
            <strong>Example:</strong> price &gt; 5000, category = Smartphones, stock_status = instock
          </div>

          {/* Supported operators info box */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            background: "#dbeafe",
            color: "#1e3a8a",
            borderRadius: 8,
            padding: "12px 14px",
            marginTop: 16,
            fontSize: 14
          }}>
            
            <div>
              <strong>Supported operators:</strong>
              <div><code>=</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></div>
            </div>
          </div>

          {/* Results */}
          <div style={{ marginTop: 24 }}>
            {error && (
              <div style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: 12,
                borderRadius: 8,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            {result && (
              <pre style={{
                marginTop: 12,
                background: "#f3f4f6",
                borderRadius: 8,
                padding: 12,
                maxHeight: 400,
                overflow: "auto",
                fontSize: 13
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
