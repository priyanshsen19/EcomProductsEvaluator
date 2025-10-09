export default function ProductCard({ p }: { p: any }) {
  return (
    <div style={{border:'1px solid #ddd', padding:12, borderRadius:8}}>
      <h3 style={{margin:0}}>{p.title}</h3>
      <div>₹{p.price}</div>
      <div>Status: {p.stock_status}</div>
      <div>Category: {p.category ?? '-'}</div>
      <div>{p.on_sale ? "On Sale" : "Regular"}</div>
      <div style={{fontSize:12, opacity:0.7}}>Created: {new Date(p.created_at).toLocaleString()}</div>
    </div>
  );
}
