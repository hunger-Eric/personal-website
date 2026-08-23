import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const exists = (relativePath: string) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("current design contract", () => {
  it("has one fixed Shijie Intelligence visual system", () => {
    const packageJson = JSON.parse(read("package.json")) as { name: string; scripts: Record<string, string> };
    const layout = read("app/layout.tsx");
    const globals = read("app/globals.css");

    expect(packageJson.name).toBe("shijie-intelligence-site");
    expect(packageJson.scripts.setup).toBeUndefined();
    expect(layout).not.toContain("ThemeProvider");
    expect(layout).not.toContain("ThemeScript");
    expect(globals).toContain("--background: #f3efe6");
    expect(globals).toContain("--foreground: #171916");
    expect(globals).toContain("--accent: #c47a18");
    expect(globals).not.toMatch(/\.light\s*\{/);
  });

  it("does not ship retired template, portfolio, or editor systems", () => {
    const retiredPaths = [
      "docker-data",
      "scripts/setup.js",
      "components/ThemeProvider.tsx",
      "components/CommandPalette.tsx",
      "components/PhotographyGallery.tsx",
      "components/cases",
      "components/sections/About.tsx",
      "config/theme.json",
      "config/cases.ts",
      "app/admin/(dashboard)/theme/page.tsx",
      "app/admin/(dashboard)/site/page.tsx",
      "app/api/admin/save/route.ts",
      "app/api/admin/[key]/route.ts",
      "components/admin/AdminEditor.tsx",
      "public/animations/projects/element-sdk/index.html",
      "docs/PROJECTS-DESIGN.md",
      "design-qa.md",
    ];

    expect(retiredPaths.filter(exists)).toEqual([]);
  });

  it("retains the current operational tools and design authorities", () => {
    [
      "DESIGN.md",
      "docs/architecture.md",
      "docs/PROJECT-STATE.md",
      "app/admin/articles/page.tsx",
      "app/admin/(crawler-dashboard)/crawlers/page.tsx",
      "config/public-identity.ts",
      "config/public-project-cases.json",
      "config/service-method.ts",
    ].forEach((relativePath) => expect(exists(relativePath), relativePath).toBe(true));
  });
});
