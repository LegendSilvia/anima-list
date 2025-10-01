import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const pwaOptions = {
  dest: "public",
//   disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
};

export default withPWA({
  ...nextConfig,
  pwa: pwaOptions,
});
