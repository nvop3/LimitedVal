// updatePrices.js
const fs    = require("fs");
const path  = require("path");
const fetch = require("node-fetch"); // if you’re on Node18+, you can drop this and use global fetch

// Fetch lowest‐ask via Roblox Economy API v2
async function getLowestAsk(assetId) {
  const url = `https://economy.roblox.com/v2/assets/${assetId}/resellers?sortOrder=Asc&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for asset ${assetId}`);
  const { data } = await res.json();
  // data is an array of listings; the first is the cheapest
  return (data[0] && typeof data[0].price === "number") ? data[0].price : null;
}

async function main() {
  const filePath = path.join(__dirname, "assetPrices.json");
  const raw      = fs.readFileSync(filePath, "utf8");
  const obj      = JSON.parse(raw);

  const updated = {};
  for (const id of Object.keys(obj)) {
    try {
      const price = await getLowestAsk(id);
      if (price !== null) {
        updated[id] = price;
        console.log(`✔️  ${id} → ${price}`);
      } else {
        console.log(`⚠️  ${id} has no active listings`);
      }
    } catch (err) {
      console.error(`❌ Failed ${id}: ${err.message}`);
    }
    // throttle between requests to avoid rate‐limit issues
    await new Promise(r => setTimeout(r, 200));
  }

  // sort keys for clean diffs
  const out = {};
  Object.keys(updated).sort((a, b) => +a - +b)
    .forEach(key => { out[key] = updated[key]; });

  fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${Object.keys(out).length} entries to assetPrices.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
