# Dobby-elf 生产部署指南

> 🧦 多比的项目部署手册 | 版本：1.0 | 创建：2026-04-23

---

## 📋 目录

- [环境要求](#环境要求)
- [快速部署](#快速部署)
- [Docker 部署](#docker-部署)
- [Ubuntu 手动部署](#ubuntu-手动部署)
- [Zeabur 部署](#zeabur-部署)
- [CI/CD 配置](#cicd-配置)
- [监控告警](#监控告警)
- [故障排查](#故障排查)

---

## 环境要求

### 服务器要求
- **操作系统**: Ubuntu 22.04+ / Debian 11+
- **CPU**: 2 核以上
- **内存**: 2GB 以上
- **存储**: 20GB 以上 SSD
- **网络**: 公网 IP + 域名

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Nginx 1.20+（可选，用于反向代理）
- Node.js 20+（手动部署时需要）

---

## 快速部署

### 一键部署脚本

```bash
# 1. 克隆项目
git clone https://github.com/Panb-KG/dobby-elf.git
cd dobby-elf

# 2. 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 填写实际配置

# 3. 执行部署
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh production
```

---

## Docker 部署

### 1. 准备环境

```bash
# 创建项目目录
sudo mkdir -p /var/www/dobby-elf
cd /var/www/dobby-elf

# 克隆项目
sudo git clone https://github.com/Panb-KG/dobby-elf.git .

# 配置环境变量
sudo cp .env.production.example .env.production
sudo nano .env.production  # 编辑配置
```

### 2. 启动服务

```bash
# 启动所有服务
sudo docker-compose up -d

# 查看服务状态
sudo docker-compose ps

# 查看日志
sudo docker-compose logs -f app
```

### 3. 数据库迁移

```bash
sudo docker-compose run --rm app npm run migrate
```

### 4. 停止服务

```bash
sudo docker-compose down
```

---

## Ubuntu 手动部署

### 1. 安装依赖

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 2. 部署应用

```bash
# 创建目录
sudo mkdir -p /var/www/dobby-elf
cd /var/www/dobby-elf

# 克隆项目
sudo git clone https://github.com/Panb-KG/dobby-elf.git .

# 安装依赖
sudo npm ci --production

# 构建应用
sudo npm run build

# 数据库迁移
sudo npm run migrate
```

### 3. 启动服务

```bash
# 创建日志目录
sudo mkdir -p logs

# 使用 PM2 启动
sudo pm2 start ecosystem.config.js
sudo pm2 save
sudo pm2 startup
```

### 4. 配置 Nginx

```bash
# 安装 Nginx
sudo apt-get install -y nginx

# 复制配置文件
sudo cp nginx/conf.d/default.conf /etc/nginx/sites-available/dobby-elf
sudo ln -s /etc/nginx/sites-available/dobby-elf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## Zeabur 部署

### 1. 准备

- 注册 [Zeabur](https://zeabur.com) 账号
- 连接 GitHub 仓库

### 2. 部署

```bash
# 使用 zeabur.json 配置自动部署
# 在 Zeabur 控制台：
# 1. 新建项目
# 2. 选择 GitHub 仓库
# 3. 自动识别 Next.js 项目
# 4. 配置环境变量
# 5. 部署
```

### 3. 配置环境变量

在 Zeabur 控制台设置以下环境变量：
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

---

## CI/CD 配置

### GitHub Actions

项目已配置 `.github/workflows/ci-cd.yml`，包含：

1. **测试阶段**: 运行 lint 和测试
2. **构建阶段**: 构建 Next.js 应用
3. **Docker 阶段**: 构建并推送 Docker 镜像
4. **部署阶段**: 部署到生产服务器

### 配置 Secrets

在 GitHub 仓库设置以下 Secrets：
- `PROD_SERVER_HOST`: 生产服务器 IP
- `PROD_SERVER_USER`: SSH 用户名
- `PROD_SERVER_SSH_KEY`: SSH 私钥
- `SLACK_WEBHOOK_URL`: Slack 通知 Webhook（可选）

---

## 监控告警

### 1. 健康检查

```bash
# 手动检查
curl http://localhost:3000/api/users

# Docker 健康检查
docker inspect --format='{{.State.Health.Status}}' dobby-elf
```

### 2. 日志管理

```bash
# 查看应用日志
docker-compose logs -f app

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 日志
pm2 logs dobby-elf
```

### 3. 性能监控

```bash
# Docker 资源使用
docker stats dobby-elf

# 系统资源
htop
df -h
free -m
```

### 4. 告警配置（可选）

- **Uptime Robot**: 监控服务可用性
- **Sentry**: 错误追踪和告警
- **Slack/Discord**: 通知集成

---

## 故障排查

### 常见问题

#### 1. 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :3000

# 检查 Docker 日志
docker-compose logs app

# 检查环境变量
docker-compose exec app env
```

#### 2. 数据库错误

```bash
# 检查数据库文件
ls -la data/dobby.db

# 重新运行迁移
docker-compose run --rm app npm run migrate:reset
```

#### 3. 内存不足

```bash
# 检查内存使用
docker stats

# 调整 Docker 资源限制
# 编辑 docker-compose.yml 中的 deploy.resources
```

#### 4. SSL 证书问题

```bash
# 检查证书
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# 更新证书（Let's Encrypt）
sudo certbot renew
```

### 回滚部署

```bash
# 回滚到上一个版本
cd /var/www/dobby-elf
docker-compose pull ghcr.io/panb-kg/dobby-elf:previous
docker-compose down
docker-compose up -d

# 恢复数据库
cp /var/backups/dobby-elf/dobby_latest.db data/dobby.db
```

---

## 安全建议

1. **防火墙配置**: 只开放 80/443 端口
2. **SSH 安全**: 使用密钥认证，禁用密码登录
3. **定期备份**: 数据库每日备份
4. **更新维护**: 定期更新系统和依赖
5. **监控告警**: 配置异常告警

---

## 维护命令

```bash
# 更新应用
cd /var/www/dobby-elf
git pull
docker-compose build
docker-compose up -d

# 清理资源
docker system prune -f
docker volume prune -f

# 备份数据库
cp data/dobby.db data/dobby_$(date +%Y%m%d).db

# 查看服务状态
docker-compose ps
docker-compose logs --tail=100 app
```

---

*最后更新：2026-04-23 | 版本：1.0*
