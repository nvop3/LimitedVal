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
    // Required query params
    const params = new URLSearchParams({
      Category:        "12",  // Limited items
      CreatorType:     "All", // must include
      CreatorTargetId: "0",   // must include, even if 0
      Keyword:         "",    // must include (empty = no keyword filter)
      SortType:        "3",   // by recent avg price desc
      Limit:           limit.toString()
    });
    if (cursor) {
      params.set("Cursor", cursor);
    }

    const url = `https://catalog.roblox.com/v1/search/items/details?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Roblox Catalog HTTP ${res.status}`);
    }

    const { data, nextPageCursor } = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Unexpected response shape");
    }

    data.forEach(item => {
      seeded[item.id] = 0;
    });

    console.log(`→ Fetched ${data.length} items; next cursor = ${nextPageCursor}`);
    cursor = nextPageCursor;
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
