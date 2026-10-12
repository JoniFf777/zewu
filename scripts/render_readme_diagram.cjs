"use strict";

// 使用项目已有的浏览器依赖，将可编辑的架构图导出为高清 PNG。
const fs = require("node:fs/promises");
const path = require("node:path");
const { createRequire } = require("node:module");

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const frontendRequire = createRequire(path.join(repoRoot, "frontend", "package.json"));
  const { chromium } = frontendRequire("@playwright/test");
  const svgPath = path.join(repoRoot, "docs", "images", "agent-architecture.svg");
  const pngPath = path.join(repoRoot, "docs", "images", "agent-architecture.png");
  const svg = await fs.readFile(svgPath, "utf8");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 1456 },
      deviceScaleFactor: 2,
    });
    await page.setContent(
      `<html lang="zh-CN"><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style><body>${svg}</body></html>`,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: pngPath, fullPage: true });
    console.log(`已导出高清架构图：${pngPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
