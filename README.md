# OnePredict

- 基于 Next.js 的 SSR 应用

## 快速开始

### 一键部署（推荐）

#### Linux / macOS
```bash
# 使用 Docker Compose 部署
./deploy.sh compose

# 使用 Docker 部署
./deploy.sh docker

# 本地部署
./deploy.sh local
```

#### Windows
```powershell
# 使用 Docker Compose 部署
.\deploy.ps1 -Mode compose

# 使用 Docker 部署
.\deploy.ps1 -Mode docker

# 本地部署
.\deploy.ps1 -Mode local
```

### 手动部署

#### 方式 1: Docker Compose
```bash
docker-compose up -d
```

#### 方式 2: Docker
```bash
docker build -t onepredict:latest .
docker run -d -p 8082:8082 --name onepredict-app onepredict:latest
```

#### 方式 3: 本地部署
```bash
# 使用 pnpm
pnpm install
pnpm run build
pnpm start

# 或使用 npm
npm install
npm run build
npm start
```

## 访问应用

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *
- **本地**: http://localhost:8082
- **网络**: http://YOUR_IP:8082

## 技术栈

- **框架**: Next.js 15.5.3 (App Router + SSR)
- **UI**: React 18 + TailwindCSS + shadcn/ui
- **状态管理**: Redux Toolkit
- **数据请求**: TanStack Query
- **包管理器**: pnpm
- **容器化**: Docker + Docker Compose

## 项目结构

```
OnePredict/
 src/
   ├── app/              # Next.js App Router 页面
   ├── components/       # React 组件
   ├── lib/             # 工具库
   ├── hooks/           # 自定义 Hooks
   ├── store/           # Redux Store
   └── types/           # TypeScript 类型定义
 public/              # 静态资源
 Dockerfile           # Docker 镜像构建
 docker-compose.yml   # Docker Compose 配置
 deploy.sh           # Linux/macOS 部署脚本
 deploy.ps1          # Windows 部署脚本
 DEPLOYMENT.md       # 详细部署文档
```

## 开发指南

### 环境要求
- Node.js 20+
- pnpm 8+ (或 npm/yarn)
- Docker (可选，用于容器化部署)

### 开发模式
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:8082
```

### 构建
```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

### 代码质量
```bash
# 运行 linter
pnpm lint

# 格式化代码
pnpm format
```

## 部署选项

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署指南
- [.same/docker-deployment.md](./.same/docker-deployment.md) - Docker 部署详细文档
- [.same/ssr-migration-notes.md](./.same/ssr-migration-notes.md) - SSR 迁移说明

## 环境变量

 `.env.production` 文件并配置以下变量：

```env
# 应用配置
NODE_ENV=production
PORT=8082
HOSTNAME=0.0.0.0

# API 配置
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_PROXY_TARGET=https://your-proxy-url.com

# 其他配置...
```

## 部署脚本选项

### deploy.sh (Linux/macOS)
```bash
./deploy.sh [选项]

:::::::::
  docker       - 使用 Docker 部署（默认）
  compose      - 使用 Docker Compose 部署（推荐）
  local        - 本地部署（不使用 Docker）
  build-only   - 仅构建，不启动服务
  clean        - 清理旧的容器和镜像后重新部署
  help         - 显示帮助信息

:
  ./deploy.sh compose          # Docker Compose 部署
  ./deploy.sh docker clean     # 清理并重新部署
  ./deploy.sh local            # 本地部署
```

### deploy.ps1 (Windows)
```powershell
.\deploy.ps1 [参数]


  -Mode <docker|compose|local>  # 部署模式（默认: docker）
  -BuildOnly                    # 仅构建，不启动
  -Clean                        # 清理旧部署

:
  .\deploy.ps1 -Mode compose    # Docker Compose 部署
  .\deploy.ps1 -Clean           # 清理并重新部署
  .\deploy.ps1 -Mode local      # 本地部署
```

## Docker 镜像特性

- ✅ 多阶段构建，优化镜像大小（~200-300MB）
- ✅ 使用 pnpm 进行依赖管理
- ✅ Next.js standalone 输出模式
- ✅ 非 root 用户运行（安全性）
- ✅ 基于 Alpine Linux 轻量级镜像

## 故障排查

### 端口被占用
```bash
# 检查端口占用
lsof -i :8082  # Linux/macOS
netstat -ano | findstr :8082  # Windows

# 修改端口
# 编辑 docker-compose.yml 或设置环境变量 PORT
```

### 容器无法启动
```bash
# 查看日志
docker logs onepredict-app

# 或使用 Docker Compose
docker-compose logs -f
```

### 构建失败
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
./deploy.sh compose clean
```

## 性能优化

- ✅ SSR 渲染提升首屏加载速度
- ✅ Next.js 图片优化（自动压缩、懒加载）
- ✅ 代码分割和按需加载
- ✅ 静态资源 CDN 部署（推荐）

## 监控和日志

### 查看日志
```bash
# Docker Compose
docker-compose logs -f

# Docker
docker logs -f onepredict-app

# 本地
# 查看终端输出
```

### 容器监控
```bash
# 实时资源使用
docker stats onepredict-app
```

## License

MIT

## 贡献

 Issue 和 Pull Request！

## 联系方式

- GitHub: https://github.com/weiwengithub/OnePredict
- Issue: https://github.com/weiwengithub/OnePredict/issues

---

**🚀 立即开始部署你的 OnePredict 应用！**

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" bin boot dev etc home lib lib.usr-is-merged media mnt opt proc root run sbin srv sys tmp usr var 
```bash
./deploy.sh compose  # Linux/macOS
.\deploy.ps1 -Mode compose  # Windows
```
