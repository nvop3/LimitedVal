// updatePrices.js
import fs from "fs/promises";
import fetch from "node-fetch";

const ECON_BASE   = "https://economy.roblox.com/v1/assets";
const ASSET_FILE  = "assetPrices.json";

async function fetchPrice(id) {
  const url = `${ECON_BASE}/${id}/resellers?limit=1&sortOrder=Asc`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`⨯ Failed to fetch price for ${id}`, res.status);
    return 0;
  }
  const { data } = await res.json();
  return data?.[0]?.price || 0;
}

(async () => {
  const raw    = await fs.readFile(ASSET_FILE, "utf-8");
  const prices = JSON.parse(raw);
  const ids    = Object.keys(prices);

  for (const id of ids) {
    const price = await fetchPrice(id);
    prices[id] = price;
    console.log(`→ ${id}: ${price}`);
  }

  await fs.writeFile(ASSET_FILE, JSON.stringify(prices, null, 2));
  console.log(`✅ Updated prices for ${ids.length} items`);
})();