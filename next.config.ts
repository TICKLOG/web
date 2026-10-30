import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Player pages live at /@name; /player/name is the route behind it and
  // old links redirect there.
  async rewrites() {
    return { beforeFiles: [{ source: "/@:name", destination: "/player/:name" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [{ source: "/player/:name", destination: "/@:name", permanent: true }];
  },
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
