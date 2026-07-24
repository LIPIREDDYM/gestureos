/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MediaPipe ships .wasm/.data assets that are fetched at runtime from the
  // CDN (see lib/mediapipe/handsSetup.ts) so no special webpack loaders are
  // required. We just make sure the dev server doesn't choke on the
  // "fs"/"path" node polyfills some of MediaPipe's UMD builds reference.
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
