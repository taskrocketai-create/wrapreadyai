import type { NextConfig } from "next";

// When NEXT_PUBLIC_API_URL is set, api.ts uses it as the base URL for direct
// browser-to-backend calls, so no server-side rewrite is needed.
// The rewrite is only used in local dev (NEXT_PUBLIC_API_URL unset) to proxy
// relative /api/* paths to the local backend at http://localhost:8000.
const localDevBackendUrl = "http://localhost:8000";

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "\n⚠️  [WrapReadyAI] NEXT_PUBLIC_API_URL is not set.\n" +
    "   API requests will fail in production.\n" +
    "   Set NEXT_PUBLIC_API_URL=https://<your-backend-domain> in your deployment environment.\n"
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  async rewrites() {
    // Only proxy via server-side rewrite in local dev (no NEXT_PUBLIC_API_URL).
    // In production the browser calls NEXT_PUBLIC_API_URL directly (see lib/api.ts).
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${localDevBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
