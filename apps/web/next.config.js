import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { withContentlayer } from "next-contentlayer2";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: false, swcMinify: true };

export default withContentlayer(nextConfig);
