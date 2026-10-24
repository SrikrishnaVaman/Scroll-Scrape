import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: every signed-in page shows one person's own data,
  // so each page is rendered fresh per request rather than prerendered.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
