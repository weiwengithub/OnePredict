<#
.SYNOPSIS
    OnePredict 一键部署脚本 (Windows PowerShell)

.DESCRIPTION
    自动部署 OnePredict 项目
    - 支持 Docker 和本地部署
    - 使用 pnpm 进行依赖管理
    - 提供详细的日志输出

.PARAMETER Mode
    部署模式: docker, compose, local (默认: docker)

.PARAMETER BuildOnly
    仅构建，不启动服务

.PARAMETER Clean
    清理旧的容器和镜像

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Mode compose
    .\deploy.ps1 -Mode local
    .\deploy.ps1 -Mode docker -Clean
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('docker', 'compose', 'local')]
    [string]$Mode = 'docker',
    
    [switch]$BuildOnly,
    [switch]$Clean
)

# 配置
$ProjectName = "onepredict"
$Port = 8082
$ImageName = "${ProjectName}:latest"
$ContainerName = "${ProjectName}-app"

# 颜色函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 显示横幅
function Show-Banner {
    Write-Host @"

  ___             ____               _ _      _   
 / _ \ _ __   ___|  _ \ _ __ ___  __| (_) ___| |_ 
| | | | '_ \ / _ \ |_) | '__/ _ \/ _\` | |/ __| __|
| |_| | | | |  __/  __/| | |  __/ (_| | | (__| |_ 
 \___/|_| |_|\___|_|   |_|  \___|\__,_|_|\___|\__|
                                                   
    一键部署脚本 v1.0 (Windows)

"@ -ForegroundColor Green
}

# 检查命令是否存在
function Test-Command {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# 检查系统要求
function Test-Requirements {
    Write-Info "检查系统要求..."
    
    $missingTools = @()
    
    if ($Mode -eq 'docker' -or $Mode -eq 'compose') {
        if (-not (Test-Command 'docker')) {
            $missingTools += 'docker'
        }
    }
    
    if ($Mode -eq 'local') {
        if (-not (Test-Command 'node')) {
            $missingTools += 'node'
        }
        
        if (-not (Test-Command 'pnpm')) {
            Write-Warning "未检测到 pnpm，将自动安装..."
            npm install -g pnpm
        }
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "缺少以下工具: $($missingTools -join ', ')"
        Write-Info "请先安装缺少的工具，然后重新运行脚本"
        exit 1
    }
    
    Write-Success "系统检查通过"
}

# 清理旧的部署
function Clear-OldDeployment {
    Write-Info "清理旧的部署..."
    
    if ($Mode -eq 'compose') {
        if (Test-Path "docker-compose.yml") {
            docker-compose down 2>$null
        }
    }
    elseif ($Mode -eq 'docker') {
        # 停止并删除旧容器
        $existingContainer = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}"
        if ($existingContainer) {
            Write-Info "停止旧容器..."
            docker stop $ContainerName 2>$null
            docker rm $ContainerName 2>$null
        }
        
        # 删除旧镜像
        if ($Clean) {
            $existingImage = docker images --filter "reference=$ImageName" --format "{{.Repository}}:{{.Tag}}"
            if ($existingImage) {
                Write-Info "删除旧镜像..."
                docker rmi $ImageName 2>$null
            }
        }
    }
    
    Write-Success "清理完成"
}

# Docker 部署
function Deploy-Docker {
    Write-Info "使用 Docker 部署..."
    
    # 构建镜像
    Write-Info "构建 Docker 镜像..."
    docker build -t $ImageName .
    
    if ($BuildOnly) {
        Write-Success "镜像构建完成: $ImageName"
        return
    }
    
    # 运行容器
    Write-Info "启动容器..."
    docker run -d `
        --name $ContainerName `
        -p "${Port}:${Port}" `
        -e NODE_ENV=production `
        -e PORT=$Port `
        --restart unless-stopped `
        $ImageName
    
    Write-Success "Docker 容器已启动"
}

# Docker Compose 部署
function Deploy-Compose {
    Write-Info "使用 Docker Compose 部署..."
    
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Error "未找到 docker-compose.yml 文件"
        exit 1
    }
    
    # 构建并启动
    Write-Info "构建并启动服务..."
    
    if ($BuildOnly) {
        docker-compose build
        Write-Success "镜像构建完成"
    }
    else {
        docker-compose up -d --build
        Write-Success "Docker Compose 服务已启动"
    }
}

# 本地部署
function Deploy-Local {
    Write-Info "使用本地环境部署..."
    
    # 安装依赖
    Write-Info "安装依赖（使用 pnpm）..."
    pnpm install
    
    # 构建应用
    Write-Info "构建应用..."
    pnpm run build
    
    if ($BuildOnly) {
        Write-Success "构建完成"
        return
    }
    
    # 启动应用
    Write-Info "启动应用..."
    Write-Info "使用 PORT=$Port pnpm start 启动服务器"
    
    $env:PORT = $Port
    Start-Process -FilePath "pnpm" -ArgumentList "start" -NoNewWindow
    
    Write-Success "应用已启动"
}

# 检查部署状态
function Test-DeploymentStatus {
    Write-Info "检查部署状态..."
    
    Start-Sleep -Seconds 3
    
    if ($Mode -eq 'compose') {
        docker-compose ps
    }
    elseif ($Mode -eq 'docker') {
        $runningContainer = docker ps --filter "name=$ContainerName" --format "{{.Names}}"
        if ($runningContainer) {
            Write-Success "容器运行中:"
            docker ps --filter "name=$ContainerName"
        }
        else {
            Write-Error "容器未运行"
            exit 1
        }
    }
    
    # 检查端口
    Write-Info "检查端口 $Port..."
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Success "服务正在监听端口 $Port"
    }
    else {
        Write-Warning "端口 $Port 未监听，服务可能尚未完全启动"
    }
}

# 显示访问信息
function Show-AccessInfo {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "          部署成功！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "  📱 访问地址: " -NoNewline
    Write-Host "http://localhost:$Port" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  📊 查看日志:" -ForegroundColor Yellow
    if ($Mode -eq 'compose') {
        Write-Host "     docker-compose logs -f" -ForegroundColor Cyan
    }
    elseif ($Mode -eq 'docker') {
        Write-Host "     docker logs -f $ContainerName" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "  🛑 停止服务:" -ForegroundColor Yellow
    if ($Mode -eq 'compose') {
        Write-Host "     docker-compose down" -ForegroundColor Cyan
    }
    elseif ($Mode -eq 'docker') {
        Write-Host "     docker stop $ContainerName" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
}

# 主函数
function Main {
    Show-Banner
    
    Write-Info "部署模式: $Mode"
    Write-Info "端口: $Port"
    
    # 检查系统要求
    Test-Requirements
    
    # 清理旧部署
    Clear-OldDeployment
    
    # 执行部署
    switch ($Mode) {
        'docker' { Deploy-Docker }
        'compose' { Deploy-Compose }
        'local' { Deploy-Local }
    }
    
    # 检查部署状态
    if (-not $BuildOnly) {
        Test-DeploymentStatus
        Show-AccessInfo
    }
}

# 运行主函数
Main
