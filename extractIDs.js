// extractIDs.js
const fs    = require("fs");
const fetch = require("node-fetch");

async function fetchLimitedAssetIds() {
  const seeded = {};
  let cursor      = "";
  const limit     = 100;

  do {
    const base = `https://catalog.roblox.com/v1/search/items/details?Category=12`
               + `&Limit=${limit}&SortType=3`;
    const url  = cursor ? `${base}&Cursor=${encodeURIComponent(cursor)}` : base;

    const res  = await fetch(url);
    if (!res.ok) {
      throw new Error(`Roblox Catalog HTTP ${res.status}`);
    }

    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : [];
    items.forEach(item => {
      seeded[item.id] = 0;
    });

    console.log(`Fetched ${items.length} items; next cursor = ${json.nextPageCursor}`);
    cursor = json.nextPageCursor;
  } while (cursor);

  return seeded;
}

async function main() {
  try {
    const allIds = await fetchLimitedAssetIds();
    fs.writeFileSync(
      "assetPrices.json",
      JSON.stringify(allIds, null, 2)
    );
    console.log(`✅ Seeded ${Object.keys(allIds).length} limited IDs`);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
}

main();
