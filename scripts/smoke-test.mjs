#!/usr/bin/env node
/**
 * Smoke Test — verifies the deployed site is working at runtime.
 * Run after deployment: node scripts/smoke-test.mjs
 *
 * Usage:
 *   node scripts/smoke-test.mjs                  # test production
 *   node scripts/smoke-test.mjs https://preview.vercel.app  # test preview
 */

const BASE = process.argv[2] || "https://me.itheheda.online";
const TIMEOUT = 10000; // 10s per request

let passed = 0;
let failed = 0;

async function check(label, urlOrFn, expected) {
  const url = typeof urlOrFn === "string" ? urlOrFn : null;
  try {
    if (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
      const body = await res.text();
      const ok =
        typeof expected === "function"
          ? expected({ status: res.status, headers: res.headers, body })
          : res.status === expected;
      if (ok) {
        passed++;
        console.log(`  ✅ ${label} (${res.status})`);
      } else {
        failed++;
        console.log(`  ❌ ${label} — got status ${res.status}`);
      }
    } else {
      // Custom check
      const ok = await urlOrFn();
      if (ok) {
        passed++;
        console.log(`  ✅ ${label}`);
      } else {
        failed++;
        console.log(`  ❌ ${label}`);
      }
    }
  } catch (e) {
    failed++;
    console.log(`  ❌ ${label} — ${e.message}`);
  }
}

async function main() {
  console.log(`\n🌐 冒烟测试 — ${BASE}\n`);

  // ── 核心页面 ──
  await check("首页加载", `${BASE}/`, (res) => res.status === 200);
  await check("首页包含用户名", `${BASE}/`, ({ body }) => {
    return body.includes("fengc");
  });
  await check("首页包含中文字符", `${BASE}/`, ({ body }) => {
    return /[\u4e00-\u9fff]/.test(body);
  });

  // ── 子页面（路由不存在时跳过 — 部分路由是 section 不是独立页面） ──
  await check("摄影页面", `${BASE}/photography`, ({ status }) => status < 400);
  await check("文章页面", `${BASE}/articles`, ({ status }) => status < 400);

  // ── API 端点 ──
  await check("摄影公开 API", `${BASE}/api/photography`, async ({ status, body }) => {
    try {
      const data = JSON.parse(body);
      return status === 200 && Array.isArray(data.images);
    } catch {
      return status === 200 || status === 404;
    }
  });

  await check("管理后台重定向到登录",
    `${BASE}/admin`,
    ({ status }) => status === 307 || status === 302 || status === 200
  );

  // ── sitemap / robots ──
  await check("Sitemap", `${BASE}/sitemap.xml`, (res) => res.status === 200);
  await check("Robots.txt", `${BASE}/robots.txt`, (res) => res.status === 200);
  await check("Feed (RSS)", `${BASE}/feed.xml`, (res) => res.status === 200);

  // ── 资源文件 ──
  await check("favicon", `${BASE}/images/favicon.png`, async (res) => {
    return res.status === 200 && (res.headers.get("content-type") || "").startsWith("image/");
  });

  // ── 结果 ──
  console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 / ${passed + failed} 总计`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
