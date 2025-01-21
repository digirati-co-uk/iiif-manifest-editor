// next.config.js
const { withContentlayer } = require("next-contentlayer2");

/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, swcMinify: false };

module.exports = withContentlayer(nextConfig);
