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
};

export default nextConfig;
