// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadPhoto } from "@/lib/github-photo";

beforeEach(() => { vi.restoreAllMocks(); process.env.GITHUB_TOKEN = "test-token"; });

describe("uploadPhoto", () => {
  it("uploads public photo", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ content: { path: "public/images/photography/test.jpg" } }), { status: 201 }));
    const r = await uploadPhoto("test.jpg", "base64data", false);
    expect(r.path).toContain("public/images/photography");
  });

  it("uploads private photo", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ content: { path: "private-photos/test.jpg" } }), { status: 201 }));
    const r = await uploadPhoto("test.jpg", "base64data", true);
    expect(r.path).toContain("private-photos");
  });
});
