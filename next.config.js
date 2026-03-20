/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Ignore ESLint warnings during build (Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (Vercel)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
