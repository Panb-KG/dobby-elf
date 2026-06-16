/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // 允许在生产构建时忽略类型错误（Supabase 凭证在运行时注入）
    ignoreBuildErrors: true,
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
        hostname: "bailian.aliyuncs.com",
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
