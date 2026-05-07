import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // GitHub avatars and assets
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      // YouTube thumbnails
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      // Dev.to images
      {
        protocol: "https",
        hostname: "dev-to-uploads.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Medium images
      {
        protocol: "https",
        hostname: "miro.medium.com",
      },
      {
        protocol: "https",
        hostname: "cdn-images-1.medium.com",
      },
      // Unavatar.io for fetching avatars from various platforms (YouTube, etc.)
      {
        protocol: "https",
        hostname: "unavatar.io",
      },
    ],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    // Tree-shake commonly used packages so we only ship what's actually used.
    optimizePackageImports: ["lucide-react", "fuse.js", "sanitize-html"],
  },

  // Security and caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache API responses appropriately
      {
        source: "/api/github-contributions",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // Redirects for common patterns
  async redirects() {
    return [
      // www → apex. Two entries because path-param substitution into an
      // absolute destination URL leaves a literal ":path*" when the path is
      // empty (root) on the OpenNext-on-Cloudflare runtime.
      {
        source: "/",
        has: [{ type: "host", value: "www.kevintrinh.dev" }],
        destination: "https://kevintrinh.dev/",
        permanent: true,
      },
      {
        source: "/:path+",
        has: [{ type: "host", value: "www.kevintrinh.dev" }],
        destination: "https://kevintrinh.dev/:path+",
        permanent: true,
      },
      // Redirect old routes if you migrate from another portfolio
      // { source: '/portfolio', destination: '/projects', permanent: true },
    ];
  },

  // Remove console.logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: false,

  // Strict mode for React
  reactStrictMode: true,

  // Powered by header (disable for security)
  poweredByHeader: false,
};

export default nextConfig;
