// extractIDs.js
const fs    = require("fs");
const fetch = require("node-fetch");

async function main() {
  const url = "https://www.rolimons.com/itemapi/limited"; 
  // this endpoint returns all limiteds with fields: assetid, name, price, etc.

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Rolimons HTTP ${res.status}`);
  const { Items } = await res.json(); 
  if (!Array.isArray(Items)) throw new Error("Unexpected payload");

  // build an object { [assetId]: 0, ... }
  const seeded = Items.reduce((acc, item) => {
    acc[item.assetid] = 0;
    return acc;
  }, {});

  fs.writeFileSync(
    "./assetPrices.json",
    JSON.stringify(seeded, null, 2)
  );

  console.log(`Extracted and seeded ${Items.length} limited IDs`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
