// extractIDs.js
const fs    = require("fs");
const fetch = require("node-fetch");

async function main() {
  // 1) Fetch limited list from Rolimons
  const resp = await fetch("https://api.rolimons.com/limiteds/get-data");
  if (!resp.ok) throw new Error(`Rolimons HTTP ${resp.status}`);
  const { data } = await resp.json(); // [ [id, name, lowestAsk, ...], ... ]

  // 2) Build JSON object with IDs as keys and 0 as placeholder
  const obj = {};
  data.forEach(row => {
    const id = row[0];
    obj[id] = 0;
  });

  // 3) Write to assetPrices.json
  fs.writeFileSync(
    "./assetPrices.json",
    JSON.stringify(obj, null, 2)
  );
  console.log(`Populated ${data.length} IDs into assetPrices.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
