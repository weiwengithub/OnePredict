/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    unoptimized: true,
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
