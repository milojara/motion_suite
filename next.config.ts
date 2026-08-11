import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @remotion/bundler y @remotion/renderer traen binarios nativos
  // (webpack, esbuild, el compositor de Remotion) que deben resolverse con
  // require() de Node en vez de pasar por el bundler de Next.
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer", "esbuild"],
};

export default nextConfig;
