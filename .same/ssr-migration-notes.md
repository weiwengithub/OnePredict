# SSR 部署迁移说明

## 更改概述
已成功将 OnePredict 项目从静态打包部署（Static Export）改为服务器端渲染（SSR）部署。

## 具体更改

### 1. next.config.js
**更改内容：**
- 移除了生产环境的静态导出配置
  - 删除 `output: 'export'`
  - 删除 `distDir: 'out'`
- 启用 Next.js 图片优化功能
  - 将 `images.unoptimized` 从 `true` 改为 `false`

**影响：**
- 项目现在将在服务器端渲染，而非生成静态HTML文件
- 支持 Next.js 的所有 SSR 功能，包括：
  - 服务器组件（Server Components）
  - API 路由（API Routes）
  - 动态路由（Dynamic Routes）
  - 图片优化（Image Optimization）
  - 增量静态再生成（ISR）

### 2. netlify.toml
**新增文件：**
创建了 `netlify.toml` 配置文件用于 Netlify 部署

**配置内容：**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**说明：**
- 使用 `@netlify/plugin-nextjs` 插件支持 Next.js SSR 部署
- 构建命令设置为 `npm run build`
- 发布目录设置为 `.next`（Next.js 构建输出目录）

### 3. package.json
**更改内容：**
- 更新开发服务器启动命令
  - 从 `next dev -p 8082` 改为 `next dev -H 0.0.0.0 -p 8082`
  - 添加 `-H 0.0.0.0` 参数以支持远程访问

## SSR vs 静态导出对比

### 静态导出（之前）
- ✅ 部署简单，只需静态文件服务器
- ✅ 性能优秀，CDN 友好
- ❌ 不支持服务器端功能
- ❌ 不支持动态路由
- ❌ 不支持 API 路由
- ❌ 不支持图片优化

### SSR 部署（现在）
- ✅ 支持所有 Next.js 功能
- ✅ 动态内容更新更灵活
- ✅ 支持服务器端数据获取
- ✅ 支持 API 路由
- ✅ 支持图片优化
- ✅ SEO 优化更好
- ⚠️ 需要 Node.js 运行环境
- ⚠️ 部署成本可能略高

## 部署说明

### 在 Netlify 上部署
1. 将项目推送到 Git 仓库
2. 在 Netlify 上导入项目
3. Netlify 会自动检测 `netlify.toml` 配置
4. 点击部署，Netlify 会自动使用 SSR 模式部署

### 环境变量
确保在 Netlify 部署设置中配置所有必要的环境变量：
- `.env.production` 中的变量需要在 Netlify 环境变量中设置

## 兼容性检查
✅ 项目成功运行在 SSR 模式
✅ 无需修改现有组件代码
✅ 所有依赖正常安装
✅ 开发服务器正常启动

## 注意事项
- 项目使用 Next.js 15.5.3，完全支持 SSR
- 使用 App Router，天然支持服务器组件
- 无需担心客户端专用 API 的使用，Next.js 会自动处理
