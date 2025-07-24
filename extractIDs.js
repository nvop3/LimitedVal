// extractIDs.js
// Fetches ALL Limited item IDs from Roblox’s Catalog API (Category=12)
// and writes them as keys to assetPrices.json with value 0.

const fs    = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch@2

async function fetchAllLimitedIds() {
  const seeded = {};
  let cursor  = "";
  const limit = 100;

  do {
    // Build query params
    const params = new URLSearchParams({
      Category: "12",              // Category 12 == Limited items
      Limit:    limit.toString(),
      SortType: "3"                // Sort by recent average price desc
    });
    if (cursor) params.set("Cursor", cursor);

    const url = `https://catalog.roblox.com/v1/search/items/details?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Roblox Catalog HTTP ${res.status}`);
    }

    const json  = await res.json();
    const items = Array.isArray(json.data) ? json.data : [];

    // Seed each asset ID
    items.forEach(item => {
      seeded[item.id] = 0;
    });

    console.log(`→ Fetched ${items.length} items; next cursor = ${json.nextPageCursor}`);
    cursor = json.nextPageCursor;
  } while (cursor);

  return seeded;
}

(async () => {
  try {
    const allIds = await fetchAllLimitedIds();
    fs.writeFileSync(
      "assetPrices.json",
      JSON.stringify(allIds, null, 2)
    );
    console.log(`✅ Seeded ${Object.keys(allIds).length} limited IDs`);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
