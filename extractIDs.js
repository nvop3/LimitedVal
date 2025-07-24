// extractIDs.js
const fs    = require("fs");
const fetch = require("node-fetch");

async function fetchLimitedsPage() {
  const res = await fetch("https://www.rolimons.com/limiteds", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT)" }
  });
  if (!res.ok) throw new Error(`Page HTTP ${res.status}`);
  return await res.text();
}

function parseNuxtState(html) {
  // window.__NUXT__ = { state: { items: { limiteds: [...] }, ... }, ... };
  const match = html.match(/window\.__NUXT__\s*=\s*(\{.+?\});/s);
  if (!match) throw new Error("Could not find Nuxt state in HTML");
  const nuxt = JSON.parse(match[1]);
  if (
    !nuxt.state ||
    !nuxt.state.items ||
    !Array.isArray(nuxt.state.items.limiteds)
  ) {
    throw new Error("Unexpected Nuxt state shape");
  }
  return nuxt.state.items.limiteds;
}

async function main() {
  try {
    const html     = await fetchLimitedsPage();
    const items    = parseNuxtState(html);
    const seeded   = items.reduce((acc, item) => {
      // item.assetId is the numeric ID
      acc[item.assetId] = 0;
      return acc;
    }, {});

    fs.writeFileSync(
      "./assetPrices.json",
      JSON.stringify(seeded, null, 2)
    );

    console.log(`✅ Seeded ${items.length} limited IDs`);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
}

main();
