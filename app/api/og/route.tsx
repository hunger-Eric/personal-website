// app/api/og/route.tsx
// Dynamic Open Graph image generation
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getOgPalette, ogCopy, ogPalettes } from "@/config/ogTheme";

// Use nodejs runtime to avoid edge-runtime build warnings in this repo.
export const runtime = "nodejs";

// Image dimensions for OG
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL
    const title = searchParams.get("title") || ogCopy.defaultTitle;
    const subtitle = searchParams.get("subtitle") || ogCopy.defaultSubtitle;
    const theme = searchParams.get("theme") || "dark";

    const palette = getOgPalette(theme);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.background,
            backgroundImage: `radial-gradient(circle at 25px 25px, ${palette.pattern} 2%, transparent 0%)`,
            backgroundSize: "50px 50px",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {/* Accent gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: `linear-gradient(90deg, ${palette.accent}, ${palette.accentSecondary}, ${palette.accent})`,
            }}
          />

          {/* Content container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              maxWidth: "1000px",
            }}
          >
            {/* Logo/Avatar placeholder */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "60px",
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.accentSecondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "40px",
                boxShadow: `0 20px 40px ${palette.accentShadow}`,
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: palette.accentForeground,
                }}
              >
                {title.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: palette.foreground,
                textAlign: "center",
                lineHeight: 1.2,
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: "28px",
                fontWeight: 400,
                color: palette.muted,
                textAlign: "center",
                lineHeight: 1.4,
                maxWidth: "800px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom accent bar */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: palette.accent,
              }}
            />
            <span
              style={{
                fontSize: "16px",
                color: palette.muted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {ogCopy.contextLabel}
            </span>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          // Cache the image for 1 year (immutable content based on params)
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (error: unknown) {
    console.error(ogCopy.generationError, error);

    // Return a simple fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ogPalettes.dark.background,
            color: ogPalettes.dark.foreground,
            fontSize: "48px",
            fontWeight: 700,
          }}
        >
          {ogCopy.contextLabel}
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
      }
    );
  }
}
