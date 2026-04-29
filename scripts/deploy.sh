#!/bin/bash

# Dobi-elf 生产环境部署脚本
# 用法：./scripts/deploy.sh [environment]
# environment: staging | production (默认 production)

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/dobi-elf"
BACKUP_DIR="/var/backups/dobi-elf"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 开始部署 Dobi-elf ($ENVIRONMENT)..."

# === 1. 环境检查 ===
check_requirements() {
    echo "📋 检查系统要求..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装"
        exit 1
    fi
    
    echo "✅ 系统要求检查通过"
}

# === 2. 备份数据库 ===
backup_database() {
    echo "💾 备份数据库..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$PROJECT_DIR/data/dobi.db" ]; then
        cp "$PROJECT_DIR/data/dobi.db" "$BACKUP_DIR/dobi_$TIMESTAMP.db"
        echo "✅ 数据库备份完成: $BACKUP_DIR/dobi_$TIMESTAMP.db"
    else
        echo "⚠️  数据库文件不存在，跳过备份"
    fi
}

# === 3. 拉取最新镜像 ===
pull_images() {
    echo "📥 拉取最新 Docker 镜像..."
    
    cd "$PROJECT_DIR"
    docker-compose pull
    echo "✅ 镜像拉取完成"
}

# === 4. 数据库迁移 ===
run_migrations() {
    echo "🔧 运行数据库迁移..."
    
    cd "$PROJECT_DIR"
    docker-compose run --rm app npm run migrate
    echo "✅ 数据库迁移完成"
}

# === 5. 重启服务 ===
restart_services() {
    echo "🔄 重启服务..."
    
    cd "$PROJECT_DIR"
    docker-compose down
    docker-compose up -d
    echo "✅ 服务重启完成"
}

# === 6. 健康检查 ===
health_check() {
    echo "🏥 执行健康检查..."
    
    sleep 10  # 等待服务启动
    
    if curl -f http://localhost:3000/api/users &> /dev/null; then
        echo "✅ 健康检查通过"
    else
        echo "❌ 健康检查失败，回滚部署..."
        rollback
        exit 1
    fi
}

# === 7. 回滚 ===
rollback() {
    echo "⏪ 回滚到上一个版本..."
    
    cd "$PROJECT_DIR"
    docker-compose pull ghcr.io/panb-kg/dobi-elf:$(git rev-parse HEAD~1)
    docker-compose down
    docker-compose up -d
    
    # 恢复数据库
    if [ -f "$BACKUP_DIR/dobi_latest.db" ]; then
        cp "$BACKUP_DIR/dobi_latest.db" "$PROJECT_DIR/data/dobi.db"
    fi
}

# === 8. 清理 ===
cleanup() {
    echo "🧹 清理未使用的资源..."
    
    docker system prune -f
    docker volume prune -f
    
    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "dobi_*.db" -mtime +7 -delete
    
    echo "✅ 清理完成"
}

# === 9. 日志 ===
show_logs() {
    echo "📊 最近日志..."
    
    cd "$PROJECT_DIR"
    docker-compose logs --tail=50 app
}

# === 主流程 ===
main() {
    check_requirements
    backup_database
    pull_images
    run_migrations
    restart_services
    health_check
    cleanup
    show_logs
    
    echo ""
    echo "🎉 部署完成！"
    echo "📍 访问地址: http://localhost:3000"
    echo "📊 服务状态: docker-compose -f $PROJECT_DIR/docker-compose.yml ps"
    echo "📝 查看日志: docker-compose -f $PROJECT_DIR/docker-compose.yml logs -f app"
}

main "$@"
