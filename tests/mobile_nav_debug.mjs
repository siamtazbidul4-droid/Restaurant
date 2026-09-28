export default async function run(page, ui) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000/menu', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const btn = page.locator('button[aria-label="Open Navigation"]');
  const box = await btn.boundingBox();
  const obstruct = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return { tag: el?.tagName, cls: el?.className?.toString?.().slice(0, 120), text: el?.textContent?.slice(0, 60) };
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  return { box, obstruct };
}
