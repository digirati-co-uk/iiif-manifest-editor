/** @type {import('next').NextConfig} */

const PERSISTENCEURL = {
  prod: "https://iiif-preview.stephen.wf/store",
  // Need iiif-preview to be running locally.
  local: "http://127.0.0.1:8787/store"
};

const nextConfig = {
  reactStrictMode: true,
  target: "serverless",
  headerless: "true",
  async rewrites() {
    return [
      {
        source: "/api/save/:path*",
        destination: PERSISTENCEURL.prod
      }
    ];
  }
};

module.exports = nextConfig
