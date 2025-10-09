export type Clause = { field: string; op: string; value: any };

const allowed = new Set([
  "id","title","price","stock_status","stock_quantity","category","tags","on_sale","created_at"
]);
const ops = new Set(["=","!="," >", "<", ">=","<="]);

export function parseRules(text: string): Clause[] {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const clauses: Clause[] = [];
  for (const line of lines) {
    const m = line.match(/^([a-z_]+)\s*(=|!=|>=|<=|>|<)\s*(.+)$/i);
    if (!m) throw new Error(`Invalid rule: ${line}`);
    const [, rawField, op, rawVal] = m;
    const field = rawField.toLowerCase();
    if (!allowed.has(field)) throw new Error(`Invalid field: ${field}`);
    let value: any = rawVal;
    if (/^(true|false)$/i.test(rawVal)) value = /^true$/i.test(rawVal);
    else if (!isNaN(Number(rawVal))) value = Number(rawVal);
    else if (field === "created_at") {
      const t = Date.parse(rawVal);
      if (isNaN(t)) throw new Error(`Invalid date: ${rawVal}`);
      value = new Date(t);
    } else value = rawVal.replace(/^"(.+)"$|^'(.+)'$/, "$1$2");
    clauses.push({ field, op, value });
  }
  return clauses;
}

export function toMongoFilter(cs: Clause[]) {
  const f: any = {};
  for (const { field, op, value } of cs) {
    if (field === "tags" && (op === "=" || op === "!=")) {
      if (op === "=") f.tags = value;
      else f.tags = { $ne: value };
      continue;
    }
    const map: any = { "=": "$eq", "!=": "$ne", ">": "$gt", "<": "$lt", ">=": "$gte", "<=": "$lte" };
    if (op === "=") f[field] = value;
    else {
      if (!f[field]) f[field] = {};
      f[field][map[op]] = value;
    }
  }
  return f;
}
