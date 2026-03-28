# Ubuntu 24.04 部署指南

## 系统要求

- **操作系统**: Ubuntu 24.04 LTS
- **Node.js**: 14.15.2 - 18.x (推荐 18.x LTS)
- **内存**: 最低 512MB，推荐 1GB+
- **磁盘**: 最低 1GB

## 一、系统准备

### 1. 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装编译工具（原生模块依赖）

项目使用 `bcrypt` 和 `better-sqlite3` 原生模块，需要编译工具：

```bash
sudo apt install -y build-essential python3
```

### 3. 安装 Node.js

#### 方法一：使用 NodeSource（推荐）

```bash
# 安装 Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v18.x.x
npm --version
```

#### 方法二：使用 nvm（多版本管理）

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

### 4. 安装进程管理器 PM2

```bash
sudo npm install -g pm2
```

## 二、项目部署

### 1. 创建应用目录

```bash
sudo mkdir -p /var/www/dobby-elf
sudo chown -R $USER:$USER /var/www/dobby-elf
```

### 2. 上传项目文件

```bash
# 方式一：使用 git
cd /var/www
git clone <your-repo-url> dobby-elf

# 方式二：使用 scp
scp -r ./dobby-elf user@server:/var/www/
```

### 3. 安装依赖

```bash
cd /var/www/dobby-elf
npm install
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**必须配置的环境变量：**

```env
# JWT密钥（必须修改为随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI服务密钥（至少配置一个）
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
# 或
BAILIAN_API_KEY=your-bailian-api-key
BAILIAN_BASE_URL=https://bailian.aliyun.com/api/v1

# 应用URL（可选，用于回调）
APP_URL=https://your-domain.com

# 端口（可选，默认3000）
PORT=3000
```

### 5. 创建数据目录

```bash
mkdir -p /var/www/dobby-elf/data
chmod 755 /var/www/dobby-elf/data
```

### 6. 构建项目

```bash
npm run build
```

## 三、进程管理

### 1. 使用 PM2 启动

```bash
# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'dobby-elf',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dobby-elf',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs dobby-elf

# 设置开机自启
pm2 startup
pm2 save
```

### 2. PM2 常用命令

```bash
pm2 restart dobby-elf    # 重启
pm2 stop dobby-elf       # 停止
pm2 delete dobby-elf     # 删除
pm2 logs dobby-elf       # 查看日志
pm2 monit                # 监控
```

## 四、Nginx 反向代理（推荐）

### 1. 安装 Nginx

```bash
sudo apt install -y nginx
```

### 2. 配置站点

```bash
sudo nano /etc/nginx/sites-available/dobby-elf
```

**配置内容：**

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超时时间（用于AI响应）
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }

    # 增加请求体大小限制（用于图片上传）
    client_max_body_size 20M;
}
```

### 3. 启用站点

```bash
sudo ln -s /etc/nginx/sites-available/dobby-elf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（可选）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 五、防火墙配置

```bash
# 开放端口
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS

# 启用防火墙
sudo ufw enable
```

## 六、数据库备份

### 1. 创建备份脚本

```bash
cat > /var/www/dobby-elf/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/dobby-elf/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
cp /var/www/dobby-elf/data/dobby.db $BACKUP_DIR/dobby_$DATE.db

# 保留最近7天的备份
find $BACKUP_DIR -name "dobby_*.db" -mtime +7 -delete

echo "Backup completed: dobby_$DATE.db"
EOF

chmod +x /var/www/dobby-elf/backup.sh
```

### 2. 设置定时备份

```bash
# 添加到 crontab
crontab -e

# 每天凌晨3点备份
0 3 * * * /var/www/dobby-elf/backup.sh >> /var/www/dobby-elf/backup.log 2>&1
```

## 七、更新部署

```bash
cd /var/www/dobby-elf

# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart dobby-elf
```

## 八、故障排查

### 1. 查看日志

```bash
# PM2 日志
pm2 logs dobby-elf

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 2. 常见问题

#### 原生模块编译失败

```bash
# 重新安装编译工具
sudo apt install -y build-essential python3

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 数据库权限问题

```bash
chmod 755 /var/www/dobby-elf/data
chmod 644 /var/www/dobby-elf/data/dobby.db
```

#### 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000

# 修改端口
export PORT=3001
pm2 restart dobby-elf
```

## 九、安全建议

1. **修改默认 JWT_SECRET**：使用强随机字符串
2. **限制数据库访问**：确保 data 目录权限正确
3. **启用 HTTPS**：使用 Let's Encrypt 免费证书
4. **定期备份**：设置自动备份计划
5. **更新系统**：定期执行 `apt update && apt upgrade`

## 十、性能优化

### 1. 启用 Gzip 压缩（Nginx）

```nginx
# 在 /etc/nginx/nginx.conf 中添加
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 2. 配置缓存（Nginx）

```nginx
# 静态资源缓存
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 3. PM2 集群模式（多核CPU）

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dobby-elf',
    script: 'npm',
    args: 'start',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',
    // ...其他配置
  }]
};
```

## 十一、监控

### 1. PM2 监控

```bash
# 安装 pm2-logrotate
pm2 install pm2-logrotate

# 查看监控
pm2 monit
```

### 2. 系统监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看系统资源
htop
```

## 检查清单

- [ ] Node.js 版本正确（14.15.2 - 18.x）
- [ ] 编译工具已安装（build-essential, python3）
- [ ] 环境变量已配置（.env 文件）
- [ ] 数据目录已创建（data/）
- [ ] 项目已构建（npm run build）
- [ ] PM2 已启动并设置开机自启
- [ ] Nginx 反向代理已配置
- [ ] 防火墙已配置
- [ ] HTTPS 已启用（生产环境）
- [ ] 数据库备份计划已设置
