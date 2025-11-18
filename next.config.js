/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出配置，启用SSR部署
  // SSR模式下不需要 output: 'export' 和 distDir: 'out'

  // Docker 部署配置：生成独立的服务器包
  output: 'standalone',

  // 确保导出的路由以目录形式存在，例如 /waiting -> waiting/index.html
  trailingSlash: true,
  allowedDevOrigins: ["*.preview.same-app.com"],

  // 开发环境API代理配置
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_PROXY_TARGET}/:path*`,
        },
      ];
    }
    return [];
  },
  images: {
    // SSR模式下可以使用Next.js图片优化
    unoptimized: false,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
  webpack(config) {
    // 让 ?url 变成静态 URL，其它 .svg 变成 React 组件（SVGR）
    config.module.rules.push({
      test: /\.svg$/i,
      oneOf: [
        {
          resourceQuery: /url/,     // 形如 import iconUrl from './x.svg?url'
          type: 'asset',            // 得到 URL 字符串
        },
        {
          issuer: /\.[jt]sx?$/,     // 只在 TS/JS 中把 .svg 当组件
          use: [{
            loader: '@svgr/webpack',
            options: {
              icon: true,
              svgo: true,
              svgoConfig: {
                plugins: [
                  { name: 'removeDimensions', active: true },
                  { name: 'removeXMLNS', active: true },
                ],
              },
            },
          }],
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
