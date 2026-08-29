import { describe, expect, it } from "vitest";

import {
  getLocaleSwitchPath,
  localeConfig,
  localizePublicPath,
} from "@/config/locale";
import { publicIdentity } from "@/config/public-identity";

describe("public locale routing", () => {
  it("keeps Chinese URLs and adds the English prefix", () => {
    expect(localizePublicPath("/", "zh")).toBe("/");
    expect(localizePublicPath("/services", "zh")).toBe("/services");
    expect(localizePublicPath("/", "en")).toBe("/en");
    expect(localizePublicPath("/services", "en")).toBe("/en/services");
    expect(localizePublicPath("/en/projects", "zh")).toBe("/projects");
  });

  it("sends untranslated Chinese articles to the English article index", () => {
    expect(getLocaleSwitchPath("/articles/chinese-only", "en")).toBe(
      "/en/articles"
    );
    expect(getLocaleSwitchPath("/en/services", "zh")).toBe("/services");
  });

  it("switches a reviewed bilingual article to its matching English detail", () => {
    expect(
      getLocaleSwitchPath("/articles/ai-search-visibility-audit-geo", "en")
    ).toBe("/en/articles/ai-search-visibility-audit-geo");
    expect(
      getLocaleSwitchPath("/en/articles/ai-search-visibility-audit-geo", "zh")
    ).toBe("/articles/ai-search-visibility-audit-geo");
  });

  it("defines distinct HTML languages and public brand names", () => {
    expect(localeConfig.zh.htmlLang).toBe("zh-CN");
    expect(localeConfig.en.htmlLang).toBe("en");
    expect(publicIdentity.names).toEqual({
      zh: "实解智能",
      en: "SolveReal Systems",
    });
  });
});
