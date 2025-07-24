// fetchLimitedWithPrices.js
import fs from "fs/promises";
import fetch from "node-fetch";
import pLimit from "p-limit";

const CAT_URL     = "https://catalog.roblox.com/v1/search/items";
const ECON_BASE   = "https://economy.roblox.com/v1/assets";
const PAGE_LIMIT  = 100;
const CONCURRENCY = 10;

async function fetchAllIds() {
  let cursor = "";
  const ids = [];

  do {
    const url = new URL(CAT_URL);
    url.searchParams.set("Category", "12");
    url.searchParams.set("SortType", "3");
    url.searchParams.set("SortOrder", "1");
    url.searchParams.set("Limit", PAGE_LIMIT);
    if (cursor) url.searchParams.set("Cursor", cursor);

    console.log("→ Fetching IDs:", url.href);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Catalog API error ${res.status}`);

    const { data, nextPageCursor } = await res.json();
    data.forEach(item => ids.push(item.id));
    cursor = nextPageCursor || "";
  } while (cursor);

  return ids;
}

async function fetchPrice(id) {
  const url = `${ECON_BASE}/${id}/resellers?limit=1&sortOrder=Asc`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`⨯ Price fetch failed for ${id}: ${res.status}`);
    return 0;
  }
  const { data } = await res.json();
  return data?.[0]?.price || 0;
}

(async () => {
  const ids = await fetchAllIds();
  console.log(`✅ Collected ${ids.length} IDs`);

  const limiter = pLimit(CONCURRENCY);
  const results = await Promise.all(
    ids.map(id =>
      limiter(async () => {
        const price = await fetchPrice(id);
        console.log(`→ ${id}: ${price}`);
        return { id, price };
      })
    )
  );

  await fs.writeFile("limitedWithPrices.json", JSON.stringify(results, null, 2));
  console.log(`✅ Wrote ${results.length} entries to limitedWithPrices.json`);
})();