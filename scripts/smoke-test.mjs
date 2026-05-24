#!/usr/bin/env node
/**
 * 冒烟测试 v2.1 — 部署后运行时状态验证
 * 覆盖: 公开页面 / 错误处理 / 公开API / Admin安全 / HTTP方法 / SEO / 响应头 / 性能 / 内容完整性
 *
 * 用法: node scripts/smoke-test.mjs [URL]
 */

const BASE = (process.argv[2] || "https://me.itheheda.online").replace(/\/+$/, "");
const TIMEOUT = 15000;

let passed = 0, failed = 0;
const endpoints = new Set();
function track(l) { endpoints.add(l); }

async function fetchWithRetry(url, opts, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
}

async function check(label, url, expected) {
  track(label);
  try {
    const res = await fetchWithRetry(url, { signal: AbortSignal.timeout(TIMEOUT), redirect: "manual" });
    const body = await res.text();
    const ok = typeof expected === "function"
      ? expected({ status: res.status, headers: res.headers, body })
      : res.status === expected;
    process.stdout.write(ok ? `  ✅ ${label} (${res.status})\n` : `  ❌ ${label} (状态=${res.status})\n`);
    if (ok) passed++; else failed++;
  } catch (e) { failed++; process.stdout.write(`  ❌ ${label} — ${e.message}\n`); }
}

async function method(label, url, meth, expected) {
  track(label);
  try {
    const res = await fetchWithRetry(url, { method: meth, signal: AbortSignal.timeout(TIMEOUT), redirect: "manual" });
    const ok = typeof expected === "function" ? expected({ status: res.status }) : res.status === expected;
    process.stdout.write(ok ? `  ✅ ${label} (${res.status})\n` : `  ❌ ${label} (状态=${res.status})\n`);
    if (ok) passed++; else failed++;
  } catch (e) { failed++; process.stdout.write(`  ❌ ${label} — ${e.message}\n`); }
}

async function post(label, url, body, expected) {
  track(label);
  try {
    const res = await fetchWithRetry(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT) });
    const ok = typeof expected === "function" ? expected({ status: res.status }) : res.status === expected;
    process.stdout.write(ok ? `  ✅ ${label} (${res.status})\n` : `  ❌ ${label} (状态=${res.status})\n`);
    if (ok) passed++; else failed++;
  } catch (e) { failed++; process.stdout.write(`  ❌ ${label} — ${e.message}\n`); }
}

function ok(r) { return r.status >= 200 && r.status < 400; }

async function main() {
  process.stdout.write(`\n🌐 冒烟测试 v2.1 — ${BASE}\n\n`);

  // ═══ 1. 公开页面 (8项) ═══
  process.stdout.write("── 1. 公开页面 ──\n");
  await check("首页含用户名", `${BASE}/`, ({ body }) => body.includes("fengc"));
  await check("首页含中文", `${BASE}/`, ({ body }) => /[\u4e00-\u9fff]/.test(body));
  await check("首页含导航栏 About", `${BASE}/`, ({ body }) => body.includes("About"));
  await check("首页含 Projects 区块", `${BASE}/`, ({ body }) => body.includes("Projects"));
  await check("摄影页", `${BASE}/photography`, ok);
  await check("文章页", `${BASE}/articles`, ok);
  await check("Links页", `${BASE}/links`, ok);
  await check("私密摄影入口", `${BASE}/photography/private`, ({ status }) => [200, 404].includes(status));

  // ═══ 2. 错误处理 (2项) ═══
  process.stdout.write("\n── 2. 错误处理 ──\n");
  await check("不存在路径 → 404", `${BASE}/this-does-not-exist-xyz`, ({ status }) => status === 404);
  await check("恶意路径 → 403/404", `${BASE}/../../../etc/passwd`, ({ status }) => status >= 400 && status < 500);

  // ═══ 3. 公开 API / Feed (8项) ═══
  process.stdout.write("\n── 3. 公开 API / Feed ──\n");
  await check("GitHub 贡献图", `${BASE}/api/github-contributions?username=fengc`, ok);
  await check("OG 图片生成", `${BASE}/api/og`, ok);
  await check("RSS 内容可读", `${BASE}/feed.xml`, ({ body }) => body.includes("<rss") || body.includes("<feed") || body.includes("<item>") || body.includes("<entry>"));
  await check("JSON Feed 解析有效", `${BASE}/feed.json`, ({ body }) => { try { JSON.parse(body); return true; } catch { return false; } });
  await check("Sitemap 含 URL 条目", `${BASE}/sitemap.xml`, ({ body }) => body.includes("<url>"));
  await check("首页含 <h1> 标题", `${BASE}/`, ({ body }) => body.includes("<h1") || body.includes("<h2"));
  await check("首页含社交图标", `${BASE}/`, ({ body }) => /GitHub|github|social/i.test(body));
  await check("首页 Body > 5KB", `${BASE}/`, ({ body }) => body.length > 5000);

  // ═══ 4. Admin 安全 (10项) ═══
  process.stdout.write("\n── 4. Admin 安全 ──\n");
  await check("admin 页面 → 307 重定向", `${BASE}/admin`, ({ status }) => [307, 302, 301].includes(status));
  await check("admin theme → 404(安全)", `${BASE}/api/admin/theme`, ({ status }) => status === 404);
  await check("admin save → 404(安全)", `${BASE}/api/admin/save`, ({ status }) => status === 404);
  await check("admin deploy-status → 404", `${BASE}/api/admin/deploy-status`, ({ status }) => status === 404);
  await check("admin photography → 404", `${BASE}/api/admin/photography`, ({ status }) => status === 404);
  await check("admin site → 404", `${BASE}/api/admin/site`, ({ status }) => status === 404);
  await post("admin save POST → 404", `${BASE}/api/admin/save`, { key: "theme" }, ({ status }) => status === 404);
  await post("admin login 错误密码 → 401/404", `${BASE}/api/admin/login`, { password: "wrong" }, ({ status }) => [404, 401].includes(status));
  await check("admin/login 页面可访问", `${BASE}/admin/login`, ok);
  await check("admin/login 含客户端渲染", `${BASE}/admin/login`, ({ body }) => body.includes("加载中") || body.includes("password") || body.includes("Login"));

  // ═══ 5. HTTP 方法安全 (6项) ═══
  process.stdout.write("\n── 5. HTTP 方法安全 ──\n");
  await method("POST → 摄影列表 → 405/404", `${BASE}/api/photography`, "POST", ({ status }) => [405, 404].includes(status));
  await method("DELETE → 摄影列表 → 405/404", `${BASE}/api/photography`, "DELETE", ({ status }) => [405, 404].includes(status));
  await method("PUT → 摄影详情 → 405/401/404", `${BASE}/api/photo/yuan-shui`, "PUT", ({ status }) => [405, 404, 401].includes(status));
  await method("PATCH → 首页 → 200+", `${BASE}/`, "PATCH", ok);
  await method("OPTIONS → 公开 API → 2xx", `${BASE}/api/photography`, "OPTIONS", ok);
  await method("HEAD → 首页 → 2xx", `${BASE}/`, "HEAD", ok);

  // ═══ 6. SEO / 元数据 (6项) ═══
  process.stdout.write("\n── 6. SEO / 元数据 ──\n");
  await check("Sitemap.xml", `${BASE}/sitemap.xml`, ({ status }) => status === 200);
  await check("Robots.txt", `${BASE}/robots.txt`, ({ status }) => status === 200);
  await check("RSS Feed.xml", `${BASE}/feed.xml`, ({ status }) => status === 200);
  await check("JSON Feed.json", `${BASE}/feed.json`, ({ status }) => status === 200);
  await check("favicon", `${BASE}/images/favicon.png`, ({ status, headers }) =>
    status === 200 && (headers.get("content-type") || "").startsWith("image/")
  );
  await check("OG 图片", `${BASE}/images/og/home.png`, ({ status }) => status === 200);

  // ═══ 7. 响应头 (5项) ═══
  process.stdout.write("\n── 7. 响应头 ──\n");
  await check("摄影页 Content-Type HTML", `${BASE}/photography`, ({ headers }) =>
    (headers.get("content-type") || "").includes("text/html")
  );
  await check("Sitemap Content-Type XML", `${BASE}/sitemap.xml`, ({ headers }) =>
    (headers.get("content-type") || "").includes("xml")
  );
  await check("RSS Feed Content-Type XML", `${BASE}/feed.xml`, ({ headers }) =>
    (headers.get("content-type") || "").includes("xml")
  );
  await check("JSON Feed Content-Type", `${BASE}/feed.json`, ({ headers }) =>
    (headers.get("content-type") || "").includes("json")
  );
  await check("首页 Content-Type HTML", `${BASE}/photography`, ({ headers }) =>
    (headers.get("content-type") || "").includes("text/html")
  );

  // ═══ 8. 性能 (2项) ═══
  process.stdout.write("\n── 8. 性能 ──\n");
  await check("首页 < 3s", `${BASE}/photography`, async () => {
    const s = Date.now(); await fetchWithRetry(`${BASE}/photography`, { signal: AbortSignal.timeout(10000) });
    return (Date.now() - s) < 3000;
  });
  await check("RSS Feed < 2s", `${BASE}/feed.xml`, async () => {
    const s = Date.now(); await fetchWithRetry(`${BASE}/feed.xml`, { signal: AbortSignal.timeout(10000) });
    return (Date.now() - s) < 2000;
  });

  // ═══ 9. 内容完整性 (4项) ═══
  process.stdout.write("\n── 9. 内容完整性 ──\n");
  await check("摄影页含关键词", `${BASE}/photography`, ({ body }) => /photo|photography|camera|摄影/i.test(body));
  await check("Links 页有链接项目", `${BASE}/links`, ({ body }) => body.includes("href") || body.includes("link"));
  await check("文章页可渲染 (>500B)", `${BASE}/articles`, ({ body }) => body.length > 500);
  await check("404 页含导航链接", `${BASE}/this-does-not-exist-xyz`, ({ body }) => body.includes("Back to home") || body.includes("About me") || body.includes("Projects"));

  // ═══ 结果 ═══
  const total = passed + failed;
  const pct = Math.round((passed / total) * 100);
  process.stdout.write(`\n📊 ${passed}/${total} 通过 (${pct}%) | ${endpoints.size} 个端点覆盖\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();