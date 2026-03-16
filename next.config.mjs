/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "dashscope.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "bailian.aliyun.com",
      },
      {
        protocol: "https",
        hostname: "**.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "**.aliyun.com",
      }
    ],
  },
};

export default nextConfig;
