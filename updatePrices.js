// scripts/updatePrices.js
const fs       = require("fs");
const path     = require("path");
const fetch    = require("node-fetch");

async function main() {
  // 1) Fetch all limited data from Rolimons
  const resp = await fetch("https://api.rolimons.com/limiteds");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = await resp.json();  // array of arrays

  // 2) Build a mapping assetId -> lowestAsk
  //    data elements: [ AssetID, Name, LowestAsk, ... ]
  const prices = {};
  data.forEach(row => {
    const assetId   = row[0];
    const lowestAsk = row[2];
    if (typeof lowestAsk === "number" && lowestAsk > 0) {
      prices[assetId] = lowestAsk;
    }
  });

  // 3) Sort keys for cleaner git diffs
  const sortedIds = Object.keys(prices).sort((a, b) => +a - +b);
  const sortedObj = {};
  sortedIds.forEach(id => { sortedObj[id] = prices[id]; });

  // 4) Write back to assetPrices.json at repo root
  const outPath = path.join(__dirname, "../assetPrices.json");
  fs.writeFileSync(outPath, JSON.stringify(sortedObj, null, 2));
  console.log(`Wrote ${sortedIds.length} entries to assetPrices.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
