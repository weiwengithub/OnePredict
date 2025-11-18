#!/bin/bash

###############################################################################
# OnePredict 一键部署脚本
# 
# 功能：
#   - 自动检测部署环境
#   - 使用 pnpm 进行依赖管理
#   - 支持 Docker 和传统部署方式
#   - 提供详细的日志输出
#
# 使用方法：
#   ./deploy.sh [选项]
#
# 选项：
#   docker       - 使用 Docker 部署（默认）
#   compose      - 使用 Docker Compose 部署
#   local        - 本地部署（不使用 Docker）
#   build-only   - 仅构建，不启动
#   clean        - 清理旧的容器和镜像
#   help         - 显示帮助信息
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PROJECT_NAME="onepredict"
PORT=8082
IMAGE_NAME="${PROJECT_NAME}:latest"
CONTAINER_NAME="${PROJECT_NAME}-app"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    echo -e "${GREEN}"
    cat << "BANNER"
  ___             ____               _ _      _   
 / _ \ _ __   ___|  _ \ _ __ ___  __| (_) ___| |_ 
| | | | '_ \ / _ \ |_) | '__/ _ \/ _` | |/ __| __|
| |_| | | | |  __/  __/| | |  __/ (_| | | (__| |_ 
 \___/|_| |_|\___|_|   |_|  \___|\__,_|_|\___|\__|
                                                   
    一键部署脚本 v1.0
BANNER
    echo -e "${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查必要的工具
check_requirements() {
    log_info "检查系统要求..."
    
    local missing_tools=()
    
    if [ "$DEPLOY_MODE" = "docker" ] || [ "$DEPLOY_MODE" = "compose" ]; then
        if ! command_exists docker; then
            missing_tools+=("docker")
        fi
        
        if [ "$DEPLOY_MODE" = "compose" ] && ! command_exists docker-compose; then
            if ! docker compose version >/dev/null 2>&1; then
                missing_tools+=("docker-compose")
            fi
        fi
    fi
    
    if [ "$DEPLOY_MODE" = "local" ]; then
        if ! command_exists node; then
            missing_tools+=("node")
        fi
        
        if ! command_exists pnpm; then
            log_warning "未检测到 pnpm，将自动安装..."
            npm install -g pnpm
        fi
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少以下工具: ${missing_tools[*]}"
        log_info "请先安装缺少的工具，然后重新运行脚本"
        exit 1
    fi
    
    log_success "系统检查通过"
}

# 清理旧的部署
clean_old_deployment() {
    log_info "清理旧的部署..."
    
    if [ "$DEPLOY_MODE" = "compose" ]; then
        if [ -f "docker-compose.yml" ]; then
            docker-compose down 2>/dev/null || true
        fi
    elif [ "$DEPLOY_MODE" = "docker" ]; then
        # 停止并删除旧容器
        if docker ps -a | grep -q "$CONTAINER_NAME"; then
            log_info "停止旧容器..."
            docker stop "$CONTAINER_NAME" 2>/dev/null || true
            docker rm "$CONTAINER_NAME" 2>/dev/null || true
        fi
        
        # 删除旧镜像（可选）
        if [ "$CLEAN_IMAGES" = "true" ]; then
            if docker images | grep -q "$PROJECT_NAME"; then
                log_info "删除旧镜像..."
                docker rmi "$IMAGE_NAME" 2>/dev/null || true
            fi
        fi
    fi
    
    log_success "清理完成"
}

# Docker 部署
deploy_docker() {
    log_info "使用 Docker 部署..."
    
    # 构建镜像
    log_info "构建 Docker 镜像..."
    docker build -t "$IMAGE_NAME" .
    
    if [ "$BUILD_ONLY" = "true" ]; then
        log_success "镜像构建完成: $IMAGE_NAME"
        return
    fi
    
    # 运行容器
    log_info "启动容器..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:$PORT" \
        -e NODE_ENV=production \
        -e PORT="$PORT" \
        --restart unless-stopped \
        "$IMAGE_NAME"
    
    log_success "Docker 容器已启动"
}

# Docker Compose 部署
deploy_compose() {
    log_info "使用 Docker Compose 部署..."
    
    if [ ! -f "docker-compose.yml" ]; then
        log_error "未找到 docker-compose.yml 文件"
        exit 1
    fi
    
    # 构建并启动
    log_info "构建并启动服务..."
    
    if docker compose version >/dev/null 2>&1; then
        # 使用新版 docker compose
        if [ "$BUILD_ONLY" = "true" ]; then
            docker compose build
            log_success "镜像构建完成"
        else
            docker compose up -d --build
            log_success "Docker Compose 服务已启动"
        fi
    else
        # 使用旧版 docker-compose
        if [ "$BUILD_ONLY" = "true" ]; then
            docker-compose build
            log_success "镜像构建完成"
        else
            docker-compose up -d --build
            log_success "Docker Compose 服务已启动"
        fi
    fi
}

# 本地部署
deploy_local() {
    log_info "使用本地环境部署..."
    
    # 安装依赖
    log_info "安装依赖（使用 pnpm）..."
    pnpm install
    
    # 构建应用
    log_info "构建应用..."
    pnpm run build
    
    if [ "$BUILD_ONLY" = "true" ]; then
        log_success "构建完成"
        return
    fi
    
    # 启动应用
    log_info "启动应用..."
    log_info "使用 PORT=$PORT pnpm start 启动服务器"
    
    PORT=$PORT pnpm start &
    
    log_success "应用已在后台启动"
}

# 检查部署状态
check_deployment_status() {
    log_info "检查部署状态..."
    
    sleep 3  # 等待服务启动
    
    if [ "$DEPLOY_MODE" = "compose" ]; then
        if docker compose version >/dev/null 2>&1; then
            docker compose ps
        else
            docker-compose ps
        fi
    elif [ "$DEPLOY_MODE" = "docker" ]; then
        if docker ps | grep -q "$CONTAINER_NAME"; then
            log_success "容器运行中:"
            docker ps | grep "$CONTAINER_NAME"
        else
            log_error "容器未运行"
            exit 1
        fi
    fi
    
    # 检查端口
    log_info "检查端口 $PORT..."
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
        log_success "服务正在监听端口 $PORT"
    else
        log_warning "端口 $PORT 未监听，服务可能尚未完全启动"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}          部署成功！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  📱 访问地址: ${BLUE}http://localhost:$PORT${NC}"
    echo -e "  🌐 本地网络: ${BLUE}http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
    echo ""
    echo -e "  📊 查看日志:"
    if [ "$DEPLOY_MODE" = "compose" ]; then
        echo -e "     ${YELLOW}docker-compose logs -f${NC}"
    elif [ "$DEPLOY_MODE" = "docker" ]; then
        echo -e "     ${YELLOW}docker logs -f $CONTAINER_NAME${NC}"
    else
        echo -e "     ${YELLOW}查看终端输出${NC}"
    fi
    echo ""
    echo -e "  🛑 停止服务:"
    if [ "$DEPLOY_MODE" = "compose" ]; then
        echo -e "     ${YELLOW}docker-compose down${NC}"
    elif [ "$DEPLOY_MODE" = "docker" ]; then
        echo -e "     ${YELLOW}docker stop $CONTAINER_NAME${NC}"
    else
        echo -e "     ${YELLOW}pkill -f 'node.*next'${NC}"
    fi
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示帮助信息
show_help() {
    cat << HELP
OnePredict 一键部署脚本

:
    ./deploy.sh [选项]

:::::::::
    docker       - 使用 Docker 部署（默认）
    compose      - 使用 Docker Compose 部署（推荐）
    local        - 本地部署（不使用 Docker）
    build-only   - 仅构建，不启动服务
    clean        - 清理旧的容器和镜像后重新部署
    help         - 显示此帮助信息

:
    ./deploy.sh                  # 使用 Docker 部署
    ./deploy.sh compose          # 使用 Docker Compose 部署
    ./deploy.sh local            # 本地部署
    ./deploy.sh compose clean    # 清理后使用 Docker Compose 部署
    ./deploy.sh docker build-only # 仅构建 Docker 镜像

:
    PORT         - 指定端口号（默认: 8082）
    
 DEPLOYMENT.md
HELP
}

# 主函数
main() {
    show_banner
    
    # 解析参数
    DEPLOY_MODE="docker"  # 默认使用 docker
    BUILD_ONLY="false"
    CLEAN_IMAGES="false"
    
    for arg in "$@"; do
        case $arg in
            docker)
                DEPLOY_MODE="docker"
                ;;
            compose)
                DEPLOY_MODE="compose"
                ;;
            local)
                DEPLOY_MODE="local"
                ;;
            build-only)
                BUILD_ONLY="true"
                ;;
            clean)
                CLEAN_IMAGES="true"
                ;;
            help|--help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $arg"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示部署模式
    log_info "部署模式: $DEPLOY_MODE"
    log_info "端口: $PORT"
    
    # 检查系统要求
    check_requirements
    
    # 清理旧部署
    clean_old_deployment
    
    # 执行部署
    case $DEPLOY_MODE in
        docker)
            deploy_docker
            ;;
        compose)
            deploy_compose
            ;;
        local)
            deploy_local
            ;;
    esac
    
    # 检查部署状态
    if [ "$BUILD_ONLY" != "true" ]; then
        check_deployment_status
        show_access_info
    fi
}

# 运行主函数
main "$@"
