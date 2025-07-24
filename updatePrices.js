// updatePrices.js
const fs    = require("fs");
const path  = require("path");
const fetch = require("node-fetch");  // or remove this line if you rely on Node18+ global fetch

// Query Roblox Economy for lowest ask price
async function getLowestAsk(assetId) {
  const url = `https://economy.roblox.com/v2/assets/${assetId}/resellers?sortOrder=Asc&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for asset ${assetId}`);
  const { data } = await res.json();
  // data is an array of resellers; first entry has the lowest ask
  return (data[0] && typeof data[0].price === "number") 
    ? data[0].price 
    : null;
}

async function main() {
  const filePath = path.join(__dirname, "./assetPrices.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const ids = Object.keys(JSON.parse(raw));

  const prices = {};
  for (const id of ids) {
    try {
      const p = await getLowestAsk(id);
      if (p !== null) {
        prices[id] = p;
        console.log(`✔️  ${id} → ${p}`);
      } else {
        console.log(`⚠️  ${id} has no active listings`);
      }
    } catch (err) {
      console.error(`❌ Failed ${id}: ${err.message}`);
    }
    // throttle a bit to avoid hammering the API
    await new Promise(r => setTimeout(r, 200));
  }

  // Sort keys so diffs stay clean
  const out = {};
  Object.keys(prices)
    .sort((a, b) => +a - +b)
    .forEach(key => { out[key] = prices[key]; });

  fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${Object.keys(out).length} entries to assetPrices.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
