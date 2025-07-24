import fs from "fs/promises";

const BASE = "https://catalog.roblox.com/v1/search/items";
const LIMIT = 100;
let cursor = "";
const ids = [];

async function fetchPage() {
  const url = new URL(BASE);
  url.searchParams.set("Category", "12");          // Limited items
  url.searchParams.set("SortType", "3");           // e.g. newest
  url.searchParams.set("SortOrder", "1");          
  url.searchParams.set("Limit", `${LIMIT}`);
  if (cursor) url.searchParams.set("Cursor", cursor);

  console.log("→ Fetching:", url.toString());
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Catalog v1 HTTP", res.status);
    console.error("Body:", await res.text());
    return false;
  }

  const { data, nextPageCursor } = await res.json();
  data.forEach(item => ids.push(item.id));
  cursor = nextPageCursor ?? "";
  return Boolean(nextPageCursor);
}

(async () => {
  // Page through every result
  while (await fetchPage()) {}

  // Seed JSON
  const map = Object.fromEntries(ids.map(id => [id, 0]));
  await fs.writeFile("assetPrices.json", JSON.stringify(map, null, 2));
  console.log(`✅ Seeded ${ids.length} limited IDs`);
})();