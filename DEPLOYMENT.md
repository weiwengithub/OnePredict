# OnePredict 部署指南

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir=node_modules --include=*.tsx --exclude=node_

## 部署方式概览

| 部署方式 | 适用场景 | 复杂度 | 成本 |
|---------|---------|-------|-----|
| **Docker** | 生产环境、私有云 | ⭐⭐ | 💰 |
| **Netlify SSR** | 快速部署、托管服务 | ⭐ | 💰💰 |
| **Docker Compose** | 开发/测试环境 | ⭐ | 💰 |

---

## 方式 1: Docker 部署（推荐）

### 特点
- ✅ 完全可控的部署环境
- ✅ 可在任何支持 Docker 的平台运行
- ✅ 轻量级镜像（200-300MB）
- ✅ 端口：8082

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/weiwengithub/OnePredict.git
cd OnePredict
git checkout ssr-deployment

# 2. 使用 Docker Compose（最简单）
docker-compose up -d

# 或使用 Docker 命令
docker build -t onepredict:latest .
docker run -d -p 8082:8082 --name onepredict-app onepredict:latest

# 3. 访问应用
# 浏览器打开 http://localhost:8082
```

### 详细文档
 [.same/docker-deployment.md](.same/docker-deployment.md) 了解：
- 环境变量配置
- 生产环境优化
- 健康检查配置
- 故障排查指南
- 性能优化建议

---

## 方式 2: Netlify SSR 部署

### 特点
- ✅ 全托管服务，无需管理服务器
- ✅ 自动 HTTPS、CDN 加速
- ✅ 持续部署集成
- ✅ 零配置部署

### 快速开始

#### 方法 A: Netlify CLI

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 部署
netlify deploy --prod
```

#### 方法 B: GitHub 集成

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "New site from Git"
3. 选择 GitHub 仓库：`weiwengithub/OnePredict`
4. 选择分支：`ssr-deployment`
5. Netlify 会自动检测 `netlify.toml` 配置
6. 点击 "Deploy site"

### 配置说明

 `netlify.toml` 配置文件：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 环境变量设置

 Netlify Dashboard 中配置环境变量：
1. Site settings → Build & deploy → Environment
2. 添加 `.env.production` 中的变量

---

## 方式 3: 其他云平台

### Vercel

```bash
# 使用 Vercel CLI
npm install -g vercel
vercel
```

### Railway

1. 访问 [Railway](https://railway.app)
2. 导入 GitHub 仓库
3. 自动检测并部署

### AWS / Azure / GCP

 Docker 镜像部署到：
- AWS ECS / Fargate
- Azure Container Instances
- Google Cloud Run

---

## 环境变量配置

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir=node_modules --include=*.tsx --exclude=node_modules getStaticProps\|getStaticPaths *

### 必需变量

```env
NODE_ENV=production
PORT=8082
HOSTNAME=0.0.0.0
```

### 应用变量

'EOF' `.env.production` 文件配置：

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_PROXY_TARGET=https://your-proxy-url.com
# ... 其他项目特定的环境变量
```

---

## 部署前检查清单

- [ ] 环境变量已正确配置
- [ ] 依赖已安装（如使用本地构建）
- [ ] 端口 8082 可访问（如使用 Docker）
- [ ] SSL 证书已配置（生产环境）
- [ ] 域名已设置（如需要）
- [ ] 数据库连接已测试（如使用）

---

## 性能优化建议

### 1. 静态资源优化
- 使用 CDN 托管静态资源
- 启用图片优化（已在 SSR 模式启用）
- 配置适当的缓存策略

### 2. 服务器优化
- 使用反向代理（Nginx/Caddy）
- 配置 Gzip/Brotli 压缩
- 启用 HTTP/2

### 3. 监控和日志
- 配置应用监控（如 Sentry）
- 设置日志聚合
- 配置告警规则

---

## 故障排查

### Docker 相关
 [Docker 部署文档](.same/docker-deployment.md) 的故障排查部分

### Netlify 相关
1. 检查构建日志
2. 验证环境变量
3. 查看函数日志

### 常见问题

**Q: 端口 8082 被占用怎么办？**  
A: 修改 `docker-compose.yml` 中的端口映射：`"3000:8082"` 或修改 `PORT` 环境变量

**Q: 图片无法加载？**  
A: 检查 `next.config.js` 中的 `images.domains` 配置

**Q: API 请求失败？**  
A: 验证 `NEXT_PUBLIC_PROXY_TARGET` 环境变量是否正确

---

## 技术栈

- **框架**: Next.js 15.5.3
- **运行时**: Node.js 20
- **部署模式**: SSR (Server-Side Rendering)
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions（可选）

---

## 获取帮助

- 查看 [SSR 迁移文档](.same/ssr-migration-notes.md)
- 查看 [Docker 部署文档](.same/docker-deployment.md)
- 提交 [GitHub Issue](https://github.com/weiwengithub/OnePredict/issues)

---

## 更新日志

### v2.0 - Docker 部署支持
- ✅ 添加 Dockerfile 多阶段构建
- ✅ 添加 Docker Compose 配置
- ✅ 配置 standalone 输出模式
- ✅ 完整的部署文档

### v1.0 - SSR 部署转换
- ✅ 从静态导出改为 SSR
- ✅ 添加 Netlify 部署配置
- ✅ 启用图片优化功能

---

**开始部署**: 选择上述任一方式，立即部署你的 OnePredict 应用！
