# Zeabur 部署指南

## 项目概述

Dobby Elf 是一个基于 Next.js 16 的全栈应用，使用 SQLite 数据库和阿里云 Bailian AI 服务。

## Zeabur 部署要求

### 系统要求
- Node.js: 20.x 或更高版本（Next.js 16 要求）
- 内存: 最低 512MB，推荐 1GB+
- 磁盘: 最低 1GB

### 依赖项
- Next.js 16.x
- React 19.x
- better-sqlite3（原生模块）
- bcrypt（原生模块）

## 部署步骤

### 1. 准备项目

确保项目包含以下文件：
- `package.json`（包含正确的构建脚本）
- `next.config.mjs`（配置为 standalone 模式）
- `.env.example`（环境变量模板）
- `zeabur.json`（Zeabur 配置文件）

### 2. 推送到 GitHub

```bash
git add .
git commit -m "Prepare for Zeabur deployment"
git push origin main
```

### 3. 在 Zeabur 上创建服务

1. 登录 [Zeabur](https://zeabur.com)
2. 点击 "Create New Project"
3. 选择 "Deploy from GitHub"
4. 选择你的 `dobby-elf` 仓库
5. 选择 `main` 分支

### 4. 配置环境变量

在 Zeabur 项目的 "Environment Variables" 部分添加以下变量：

**必需的环境变量：**

```env
# JWT 密钥（必须修改为强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI 服务密钥（至少配置一个）
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
# 或
BAILIAN_API_KEY=your-bailian-api-key
BAILIAN_BASE_URL=https://bailian.aliyun.com/api/v1

# 应用 URL（Zeabur 会自动注入）
APP_URL=https://your-app-name.zeabur.app

# 端口（Zeabur 会自动注入）
PORT=3000

# Node 环境
NODE_ENV=production
```

### 5. 配置构建命令

Zeabur 会自动检测 Next.js 项目，但建议手动配置：

- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 6. 配置持久化存储

由于使用 SQLite 数据库，需要配置持久化存储：

1. 在 Zeabur 项目中，点击 "Add Service"
2. 选择 "Volume"（存储卷）
3. 创建一个名为 `data` 的卷
4. 将卷挂载到 `/app/data` 目录

### 7. 部署

点击 "Deploy" 按钮，Zeabur 会自动：
1. 拉取代码
2. 安装依赖
3. 构建项目
4. 启动应用

## 部署验证

### 1. 检查部署状态

在 Zeabur 控制台中查看：
- 构建日志
- 应用状态
- 健康检查

### 2. 访问应用

部署成功后，Zeabur 会提供一个 URL，例如：
```
https://your-app-name.zeabur.app
```

### 3. 测试 API

```bash
# 测试用户注册
curl -X POST https://your-app-name.zeabur.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123", "displayName": "测试用户"}'

# 测试课程查询
curl https://your-app-name.zeabur.app/api/courses?userId=user_id
```

## 常见问题

### 1. 原生模块编译失败

**问题**: `better-sqlite3` 或 `bcrypt` 编译失败

**解决方案**:
- 确保 Zeabur 使用 Node.js 20.x 或更高版本
- 在 `package.json` 中添加构建脚本：
  ```json
  "scripts": {
    "postinstall": "npm rebuild better-sqlite3 bcrypt"
  }
  ```

### 2. 数据库持久化问题

**问题**: 重启后数据库数据丢失

**解决方案**:
- 配置 Zeabur Volume 持久化存储
- 将数据库文件存储在 `/app/data` 目录

### 3. 环境变量未生效

**问题**: 应用无法读取环境变量

**解决方案**:
- 确保在 Zeabur 控制台中正确配置环境变量
- 重启应用以应用新的环境变量
- 检查 `.env.example` 文件是否包含所有必需的变量

### 4. 构建失败

**问题**: Next.js 构建失败

**解决方案**:
- 检查 `next.config.mjs` 中的 `output: "standalone"` 配置
- 确保 `package.json` 中的构建脚本正确
- 查看构建日志以获取详细错误信息

### 5. 内存不足

**问题**: 应用因内存不足而崩溃

**解决方案**:
- 在 Zeabur 中升级服务规格（增加内存）
- 优化数据库查询
- 使用 PM2 集群模式（如果 Zeabur 支持）

## 性能优化

### 1. 启用缓存

在 `next.config.mjs` 中配置缓存：

```javascript
const nextConfig = {
  output: "standalone",
  // ...其他配置
};
```

### 2. 数据库优化

- 定期清理数据库
- 使用索引优化查询
- 考虑迁移到 PostgreSQL（如果数据量增长）

### 3. CDN 配置

Zeabur 自动提供 CDN，无需额外配置。

## 监控和日志

### 1. 查看日志

在 Zeabur 控制台中：
- 点击应用
- 选择 "Logs" 标签
- 实时查看应用日志

### 2. 监控指标

Zeabur 提供：
- CPU 使用率
- 内存使用率
- 网络流量
- 请求响应时间

## 备份和恢复

### 1. 数据库备份

```bash
# 在 Zeabur 终端中执行
cp /app/data/dobby.db /app/data/dobby_backup_$(date +%Y%m%d).db
```

### 2. 自动备份

可以设置定时任务或使用 Zeabur 的备份功能。

## 更新部署

### 1. 更新代码

```bash
git add .
git commit -m "Update application"
git push origin main
```

### 2. Zeabur 自动部署

Zeabur 会自动检测到新的提交并重新部署。

### 3. 手动部署

如果自动部署未触发，可以在 Zeabur 控制台中点击 "Redeploy"。

## 成本估算

Zeabur 的免费套餐包括：
- 512MB 内存
- 1GB 存储
- 每月 100GB 流量

对于生产环境，建议使用：
- 1GB 内存：约 $5/月
- 2GB 存储：约 $2/月
- 总计：约 $7/月

## 安全建议

1. **强 JWT_SECRET**: 使用强随机字符串
2. **HTTPS**: Zeabur 自动提供 HTTPS
3. **环境变量**: 不要在代码中硬编码敏感信息
4. **定期更新**: 保持依赖项最新
5. **访问控制**: 考虑添加 IP 白名单

## 故障排查

### 1. 应用无法启动

检查：
- 环境变量是否正确配置
- 数据库文件是否存在
- 端口是否被占用

### 2. API 请求失败

检查：
- API 端点是否正确
- 请求格式是否正确
- 数据库连接是否正常

### 3. 性能问题

检查：
- 内存使用情况
- 数据库查询性能
- 网络延迟

## 检查清单

部署前检查：
- [ ] 代码已推送到 GitHub
- [ ] 环境变量已配置
- [ ] 数据库持久化已设置
- [ ] 构建命令已配置
- [ ] 健康检查路径已设置

部署后检查：
- [ ] 应用成功启动
- [ ] API 端点正常工作
- [ ] 数据库连接正常
- [ ] 日志无错误信息
- [ ] 性能指标正常

## 技术支持

- Zeabur 文档: https://zeabur.com/docs
- Next.js 文档: https://nextjs.org/docs
- 项目 GitHub: https://github.com/Panb-KG/dobby-elf

## 总结

本项目已完全适配 Zeabur 部署，主要特点：

✅ 使用 Next.js 16 standalone 模式
✅ 配置了 Zeabur 部署文件
✅ 支持环境变量配置
✅ 数据库持久化支持
✅ 健康检查端点
✅ 自动化部署流程

按照本指南，您可以在几分钟内将 Dobby Elf 部署到 Zeabur 平台。
