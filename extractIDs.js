// extractIDs.js
// Fetch every Limited item ID directly from Roblox’s v2 browse endpoint.
// Writes them as keys (value=0) into assetPrices.json

const fs    = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch@2

const BASE_URL = "https://catalog.roblox.com/v2/browse/limited-items";
const PAGE_SIZE = 100;

async function fetchAllLimitedIds() {
  const seeded = {};
  let cursor = null;

  do {
    // Build URL with pagination
    const params = new URLSearchParams({ limit: PAGE_SIZE.toString() });
    if (cursor) params.set("cursor", cursor);

    const url = `${BASE_URL}?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Roblox browse/limited-items HTTP ${res.status}`);
    }

    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : [];
    if (items.length === 0) break;

    // Seed each assetId
    for (const itm of items) {
      seeded[itm.assetId] = 0;
    }

    console.log(`→ Fetched ${items.length} IDs; next cursor = ${json.nextPageCursor}`);
    cursor = json.nextPageCursor;
  } while (cursor);

  return seeded;
}

(async () => {
  try {
    const allIds = await fetchAllLimitedIds();
    fs.writeFileSync("assetPrices.json", JSON.stringify(allIds, null, 2));
    console.log(`✅ Seeded ${Object.keys(allIds).length} limited IDs`);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
