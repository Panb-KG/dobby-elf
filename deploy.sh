#!/bin/bash

set -e

echo "==================================="
echo "  魔法小课桌 - 部署脚本"
echo "==================================="

PROJECT_DIR="/var/www/dobby-elf"

cd $PROJECT_DIR

echo "[1/5] 拉取最新代码..."
git pull

echo "[2/5] 安装依赖..."
npm install

echo "[3/5] 构建项目..."
npm run build

echo "[4/5] 重启服务..."
pm2 restart dobby-elf

echo "[5/5] 检查服务状态..."
pm2 status dobby-elf

echo "==================================="
echo "  部署完成！"
echo "==================================="
