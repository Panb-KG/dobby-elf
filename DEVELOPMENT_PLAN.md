# 魔法小课桌 - 开发计划

## 项目概述
- **项目名称**: 魔法小课桌 (Dobby's Magic Desk)
- **目标用户**: 小学生（6-12岁）及关注孩子学习的家长
- **核心目标**: 激发学习兴趣，提供个性化学习辅导

## 技术栈调整 (Node.js 14.15.2 兼容性)

### 核心依赖版本调整
| 依赖包 | 原版本 | 调整后版本 | 说明 |
|--------|--------|-----------|------|
| Next.js | ^16.1.6 | ^12.3.4 | Node.js 14兼容的最新稳定版 |
| React | ^19.0.0 | ^18.2.0 | Node.js 14兼容版本 |
| React DOM | ^19.0.0 | ^18.2.0 | 与React版本匹配 |
| TypeScript | ~5.8.2 | ~5.0.0 | 稳定版本 |
| Tailwind CSS | ^4.1.14 | ^3.4.4 | Node.js 14兼容版本 |
| bcrypt | ^6.0.0 | ^5.1.1 | Node.js 14兼容版本 |
| better-sqlite3 | ^12.8.0 | ^9.6.0 | Node.js 14兼容版本 |

### 配置文件调整

#### 1. tsconfig.json
- `target`: ES2022 → ES2019
- `lib`: ES2022 → ES2019
- `moduleResolution`: bundler → node
- 移除 `allowImportingTsExtensions`

#### 2. postcss.config.mjs
- 更新为 Tailwind CSS 3.4 兼容配置
- 添加 autoprefixer 插件

#### 3. tailwind.config.js (新建)
- 创建 Tailwind CSS 3.4 配置文件
- 定义自定义颜色和动画

#### 4. globals.css
- 更新为 Tailwind CSS 3.4 语法
- 使用 `@tailwind` 指令替代 `@import "tailwindcss"`

## 核心功能模块

### 1. 智能聊天助手 ✅
- API端点: `/api/chat`
- AI模型: 通义千问 (qwen-plus, qwen3-vl-plus)
- 功能: 流式响应、多模态支持、工具调用

### 2. 用户认证系统 ✅
- 登录: `/api/auth/login`
- 注册: `/api/auth/register`
- JWT令牌认证
- bcrypt密码加密

### 3. 课程表管理 ✅
- API端点: `/api/courses`
- 功能: 添加、删除、查询课程
- 支持校内/课外课程分类

### 4. 成就系统 ✅
- API端点: `/api/achievements`
- 积分系统、等级晋升
- 每日任务管理

### 5. 知识图谱 ✅
- API端点: `/api/knowledge`
- 学习进度追踪

### 6. 魔法绘图 ✅
- API端点: `/api/image`
- 基于文本生成图片

## 数据库设计

### SQLite数据库 (data/dobby.db)
- **users**: 用户信息表
- **courses**: 课程表
- **achievements**: 成就记录
- **daily_tasks**: 每日任务
- **knowledge_points**: 知识点

## 环境变量配置

```env
# AI服务密钥
BAILIAN_API_KEY=your_api_key
DASHSCOPE_API_KEY=your_api_key

# JWT密钥
JWT_SECRET=your_jwt_secret
```

## 开发阶段规划

### 阶段一: 环境准备 (已完成)
- [x] Node.js 14.15.2兼容性调整
- [x] 依赖版本降级
- [x] 配置文件更新

### 阶段二: 核心功能开发
- [ ] 用户认证流程优化
- [ ] 聊天功能完善
- [ ] 课程表管理UI
- [ ] 成就系统展示

### 阶段三: 功能增强
- [ ] 专注工具实现
- [ ] 魔法绘图集成
- [ ] 移动端适配优化

### 阶段四: 测试与部署
- [ ] 单元测试
- [ ] 集成测试
- [ ] 生产环境部署

## 启动命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

## 注意事项

1. **Node.js版本**: 必须使用 Node.js 14.15.2 或更高版本（但低于19.0.0）
2. **数据库**: 首次运行前确保 `data/dobby.db` 存在
3. **环境变量**: 复制 `.env.example` 为 `.env` 并填写必要配置
4. **better-sqlite3**: 需要编译，确保系统有编译工具链

## Ubuntu 24.04 部署要点

### 系统依赖
```bash
sudo apt install -y build-essential python3 nodejs npm
```

### 原生模块编译
项目使用以下原生模块，需要在Ubuntu上编译：
- **bcrypt**: 密码加密
- **better-sqlite3**: SQLite数据库

### 生产环境配置文件
- [ecosystem.config.js](./ecosystem.config.js) - PM2进程管理配置
- [backup.sh](./backup.sh) - 数据库备份脚本
- [deploy.sh](./deploy.sh) - 自动部署脚本

### 详细部署指南
参见 [DEPLOYMENT_UBUNTU.md](./DEPLOYMENT_UBUNTU.md)

## 文件结构

```
dobby-elf/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── components/        # React组件
│   ├── services/          # 服务层
│   ├── lib/               # 工具函数
│   └── globals.css        # 全局样式
├── data/                   # 数据库文件
├── Global.ts              # 全局配置
├── PRD.md                 # 产品需求文档
├── DEVELOPMENT_PLAN.md    # 开发计划
├── DEPLOYMENT_UBUNTU.md   # Ubuntu部署指南
├── ecosystem.config.js    # PM2配置
├── backup.sh              # 备份脚本
├── deploy.sh              # 部署脚本
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript配置
├── tailwind.config.js     # Tailwind配置
└── postcss.config.mjs     # PostCSS配置
```
