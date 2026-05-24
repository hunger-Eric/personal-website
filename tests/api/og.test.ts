// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

beforeEach(() => {
  vi.resetModules();
});

describe("GET /api/og", () => {
  it("uses default parameters when none are provided", async () => {
    const mockImageResponse = vi.fn(
      class {
        constructor(jsx: any, options: any) {
          return new Response(JSON.stringify({ options }), {
            headers: { "content-type": "application/json" },
          });
        }
      }
    );

    vi.doMock("next/og", () => ({
      ImageResponse: mockImageResponse,
    }));

    const { GET } = await import("@/app/api/og/route");

    const req = new NextRequest(new Request("http://localhost/api/og"));

    const res = await GET(req);
    const body = await res.json();

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    expect(mockImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    );
  });

  it("uses custom title, subtitle, and theme parameters", async () => {
    const mockImageResponse = vi.fn(
      class {
        constructor(jsx: any, options: any) {
          return new Response(JSON.stringify({ options }), {
            headers: { "content-type": "application/json" },
          });
        }
      }
    );

    vi.doMock("next/og", () => ({
      ImageResponse: mockImageResponse,
    }));

    const { GET } = await import("@/app/api/og/route");

    const req = new NextRequest(
      new Request(
        "http://localhost/api/og?title=My+Blog+Post&subtitle=Tech+Content&theme=light"
      )
    );

    const res = await GET(req);
    const body = await res.json();

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    expect(mockImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        width: 1200,
        height: 630,
      })
    );
  });

  it("returns fallback image when ImageResponse throws", async () => {
    let callCount = 0;
    const mockImageResponse = vi.fn(
      class {
        constructor(jsx: any, options: any) {
          callCount++;
          if (callCount === 1) {
            throw new Error("Image generation failed");
          }
          return new Response(JSON.stringify({ options }), {
            headers: { "content-type": "application/json" },
          });
        }
      }
    );

    vi.doMock("next/og", () => ({
      ImageResponse: mockImageResponse,
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { GET } = await import("@/app/api/og/route");

    const req = new NextRequest(new Request("http://localhost/api/og"));

    const res = await GET(req);

    // First call threw, second call (fallback) should succeed
    expect(mockImageResponse).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);

    consoleErrorSpy.mockRestore();
  });
});
