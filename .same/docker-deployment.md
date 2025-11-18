# Docker 部署指南

## 概述

OnePredict 项目已配置 Docker 部署，支持使用 Docker 或 Docker Compose 快速部署应用。

## 配置文件

- `Dockerfile` - Docker 镜像构建文件
- `docker-compose.yml` - Docker Compose 编排配置
- `.dockerignore` - Docker 构建时忽略的文件

## 部署方式

### 方式 1：使用 Docker Compose（推荐）

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|*

```bash
# 1. 克隆仓库
git clone https://github.com/weiwengithub/OnePredict.git
cd OnePredict

# 2. 切换到 ssr-deployment 分支
git checkout ssr-deployment

# 3. 配置环境变量（可选）
# 编辑 docker-compose.yml 文件，添加必要的环境变量

# 4. 构建并启动容器
docker-compose up -d

# 5. 查看日志
docker-compose logs -f

# 6. 访问应用
# 浏览器打开 http://localhost:8082
```

### 方式 2：使用 Docker 命令

 Docker Compose，可以直接使用 Docker 命令。

```bash
# 1. 构建镜像
docker build -t onepredict:latest .

# 2. 运行容器
docker run -d \
  --name onepredict-app \
  -p 8082:8082 \
  -e NODE_ENV=production \
  -e PORT=8082 \
  onepredict:latest

# 3. 查看日志
docker logs -f onepredict-app

# 4. 访问应用
# 浏览器打开 http://localhost:8082
```

## 环境变量配置

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *

```yaml
# 必需的环境变量
NODE_ENV=production
PORT=8082
HOSTNAME=0.0.0.0

# 应用特定的环境变量（根据实际需求添加）
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_PROXY_TARGET=https://your-proxy-url.com
# ... 其他环境变量
```

### 使用 .env 文件

 `.env.production` 文件：

```bash
cp .env.production.example .env.production
# 编辑 .env.production 文件，填入实际的值
```

 docker-compose.yml 中引用：

```yaml
services:
  onepredict:
    env_file:
      - .env.production
```

## Docker 镜像说明

### 多阶段构建

Dockerfile 使用多阶段构建优化镜像大小：

1. **deps** - 安装依赖
2. **builder** - 构建应用
3. **runner** - 运行时环境（最小化）

### 镜像特性

- 基于 `node:20-alpine` 轻量级镜像
- 使用非 root 用户运行（安全性）
- Next.js standalone 输出（优化的服务器包）
- 镜像大小约 200-300MB

## 常用 Docker 命令

### 查看运行状态

```bash
# Docker Compose
docker-compose ps

# Docker
docker ps
```

### 停止容器

```bash
# Docker Compose
docker-compose down

# Docker
docker stop onepredict-app
docker rm onepredict-app
```

### 重启容器

```bash
# Docker Compose
docker-compose restart

# Docker
docker restart onepredict-app
```

### 查看日志

```bash
# Docker Compose
docker-compose logs -f

# Docker
docker logs -f onepredict-app
```

### 进入容器

```bash
# Docker Compose
docker-compose exec onepredict sh

# Docker
docker exec -it onepredict-app sh
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin ssr-deployment

# 2. 重新构建并启动
docker-compose up -d --build

# 或使用 Docker 命令
docker build -t onepredict:latest .
docker stop onepredict-app
docker rm onepredict-app
docker run -d --name onepredict-app -p 8082:8082 onepredict:latest
```

## 生产环境部署建议

### 1. 使用反向代理

--------，建议使用 Nginx 或 Caddy 作为反向代理：

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 添加健康检查

 docker-compose.yml 中添加健康检查：

```yaml
services:
  onepredict:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8082"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3. 资源限制

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *

```yaml
services:
  onepredict:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. 日志管理

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *

```yaml
services:
  onepredict:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查容器状态
docker-compose ps

# 检查端口是否被占用
lsof -i :8082
```

### 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 应用无法访问

```bash
# 检查端口映射
docker port onepredict-app

# 检查防火墙
sudo ufw status

# 检查 SELinux（如果使用）
getenforce
```

## 性能优化

### 1. 使用构建缓存

 CI/CD 中使用 Docker 层缓存加速构建。

### 2. 多阶段构建优化

 Dockerfile 中实现，确保生产镜像最小化。

### 3. 使用 CDN

CDN，减轻服务器压力。

## 监控和维护

### 容器监控

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" *

- **Docker Stats**: `docker stats onepredict-app`
- **Portainer**: Web UI 管理界面
- **Prometheus + Grafana**: 完整监控方案

### 定期备份

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' "getStaticProps\|getStaticPaths" * volumes：

```bash
docker run --rm -v onepredict_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz /data
```

## 总结

 Docker 部署已配置完成
 支持 Docker 和 Docker Compose
 暴露端口：8082
 优化的多阶段构建
 生产环境就绪

cd /home/project/OnePredict && grep -r -n -H -i --exclude-dir='node_modules' --include='*.tsx' --exclude='node_modules' * "getStaticProps\|getStaticPaths"`docker-compose up -d`
