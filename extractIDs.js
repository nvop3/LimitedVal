// extractIDs.js
// Fetches every Limited item ID via Roblox’s v1 search API
// Writes them as keys (value = 0) into assetPrices.json

const fs = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch@2

// Pause between requests to be polite
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function fetchPage(cursor) {
  // These params are all required to avoid 400s
  const params = new URLSearchParams({
    Category:        "12",   // 12 = Limited items
    Keyword:         "",     // must be present
    CreatorType:     "All",  // must be present
    CreatorTargetId: "0",    // must be present (0 = no filter)
    SortType:        "2",    // 2 = most recently updated first (arbitrary)
    Limit:           "100"   // max per page
  });
  if (cursor) params.set("Cursor", cursor);

  const url = `https://catalog.roblox.com/v1/search/items/details?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Catalog v1 HTTP ${res.status}`);

  return await res.json();  // { data: [...], nextPageCursor: "..." }
}

(async () => {
  try {
    let allIds = {};
    let cursor = null;
    let page  = 1;

    do {
      const { data, nextPageCursor } = await fetchPage(cursor);
      console.log(`→ Page ${page}: fetched ${data.length} items`);
      data.forEach(item => {
        allIds[item.id] = 0;
      });
      cursor = nextPageCursor;
      page++;
      await sleep(200);
    } while (cursor);

    // Write to JSON
    fs.writeFileSync(
      "assetPrices.json",
      JSON.stringify(allIds, null, 2)
    );
    console.log(`✅ Seeded ${Object.keys(allIds).length} Limited IDs`);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
