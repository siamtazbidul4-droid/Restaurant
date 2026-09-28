export default async function run(page) {
  const out = [];
  for (const [w, h, name] of [[1280, 800, 'desktop'], [375, 812, 'mobile']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000/menu', { waitUntil: 'networkidle' }).catch(() => {});
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: `tests/inspect_${name}.png`, timeout: 15000 });
    out.push(name);
  }
  return out;
}
