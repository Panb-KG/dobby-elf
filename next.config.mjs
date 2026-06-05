/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "token-plan.cn-beijing.maas.aliyuncs.com",
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
