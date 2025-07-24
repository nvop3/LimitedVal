// updatePrices.js
const fs    = require("fs");
const path  = require("path");
const fetch = require("node-fetch");

async function main() {
  // 🔄 point at the new Rolimons API
  const resp = await fetch("https://api.rolimons.com/limiteds/get-data");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = await resp.json();  // still returns { data: [...] }

  const prices = {};
  data.forEach(row => {
    const assetId   = row[0];
    const lowestAsk = row[2];
    if (typeof lowestAsk === "number" && lowestAsk > 0) {
      prices[assetId] = lowestAsk;
    }
  });

  const sortedIds = Object.keys(prices).sort((a, b) => +a - +b);
  const sortedObj = {};
  sortedIds.forEach(id => { sortedObj[id] = prices[id]; });

  const outPath = path.join(__dirname, "./assetPrices.json");
  fs.writeFileSync(outPath, JSON.stringify(sortedObj, null, 2));
  console.log(`Wrote ${sortedIds.length} entries to assetPrices.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
