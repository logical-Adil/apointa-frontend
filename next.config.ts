import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Lockfiles above this folder (e.g. C:\Users\Adil\package-lock.json) confuse
// Turbopack's root detection; pin the app root to this directory.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  /**
   * Same-origin `/v1/*` so the browser sends the httpOnly session cookie on
   * every API call (avoids cross-port localhost cookie issues with the SPA
   * on :3000 talking directly to Express on :5000).
   *
   * Override backend target with `BACKEND_ORIGIN` (no trailing slash).
   */
  async rewrites() {
    const backend =
      process.env.BACKEND_ORIGIN?.replace(/\/+$/, "") || "http://localhost:5000";
    return [{ source: "/v1/:path*", destination: `${backend}/v1/:path*` }];
  },
  // Webpack dev (`npm run dev`) is easier on Windows CPU/RAM than default Turbopack.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
