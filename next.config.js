/** @type {import('next').NextConfig} */
const withVideos = require("next-videos");

const nextConfig = withVideos({
  eslint: {
    ignoreDuringBuilds: true,
  },
});

module.exports = nextConfig;
