import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: every signed-in page shows one person's own data,
  // so each page is rendered fresh per request rather than prerendered.
  // Load the Gemini SDK's Node.js build directly instead of bundling it.
  serverExternalPackages: ["@google/genai"],
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
