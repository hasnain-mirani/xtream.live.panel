/** @type {import('next').NextConfig} */
const nextConfig = {
   eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },  
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.pluto.tv" },
      { protocol: "https", hostname: "**.akamaized.net" },
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },
};
// 👇 CommonJS export
export default nextConfig;
