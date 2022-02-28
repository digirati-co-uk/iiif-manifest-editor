/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  target: "serverless",
  node: {
    fs: 'empty'
  }
};

module.exports = nextConfig;
