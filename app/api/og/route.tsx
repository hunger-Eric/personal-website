// app/api/og/route.tsx
// Dynamic Open Graph image generation
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Use nodejs runtime to avoid edge-runtime build warnings in this repo.
export const runtime = "nodejs";

// Image dimensions for OG
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL
    const title = searchParams.get("title") || "fengc";
    const subtitle = searchParams.get("subtitle") || "Full-Stack Developer";
    const theme = searchParams.get("theme") || "dark";

    // Theme colors
    const isDark = theme === "dark";
    const bgColor = isDark ? "#050816" : "#ffffff";
    const textColor = isDark ? "#f4f4f5" : "#1f2937";
    const mutedColor = isDark ? "#71717a" : "#6b7280";
    const accentColor = "#4f46e5";

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
            backgroundColor: bgColor,
            backgroundImage: `radial-gradient(circle at 25px 25px, ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} 2%, transparent 0%)`,
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
              background: `linear-gradient(90deg, ${accentColor}, #7c3aed, ${accentColor})`,
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
                background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "40px",
                boxShadow: `0 20px 40px ${isDark ? "rgba(79, 70, 229, 0.3)" : "rgba(79, 70, 229, 0.2)"}`,
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#ffffff",
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
                color: textColor,
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
                color: mutedColor,
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
                backgroundColor: accentColor,
              }}
            />
            <span
              style={{
                fontSize: "16px",
                color: mutedColor,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Website
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
    console.error("OG Image generation error:", error);

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
            backgroundColor: "#050816",
            color: "#f4f4f5",
            fontSize: "48px",
            fontWeight: 700,
          }}
        >
          Website
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
      }
    );
  }
}
