import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "\n⚠️  [WrapReadyAI] NEXT_PUBLIC_API_URL is not set.\n" +
    "   API requests will fall back to http://localhost:8000, which will fail in production.\n" +
    "   Set NEXT_PUBLIC_API_URL=https://<your-backend-domain> in your deployment environment.\n"
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
