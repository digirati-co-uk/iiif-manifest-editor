import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.argv.includes("dev")) {
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

export default nextConfig;
