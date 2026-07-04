# 📔 魔法日记 Supabase 设置指南

## 🎯 目标
在 Supabase 中创建魔法日记功能所需的数据库表结构。

---

## 📋 前置条件

1. ✅ 已有 Supabase 项目
2. ✅ 已配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 执行步骤

### 方法 1: Supabase Dashboard（推荐）

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **进入 SQL Editor**
   - 左侧菜单 → **SQL Editor**
   - 点击 **New query**

3. **执行 SQL 脚本**
   - 打开文件：`supabase/migrations/001_create_diary_tables.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **Run** 按钮执行

4. **验证结果**
   - 左侧菜单 → **Table Editor**
   - 应该看到两个新表：
     - `diary_raw` （原始输入表）
     - `diary_processed` （整理后日记表）

---

### 方法 2: Supabase CLI（高级）

```bash
# 1. 安装 Supabase CLI（如果未安装）
brew install supabase/tap/supabase

# 2. 登录 Supabase
supabase login

# 3. 链接到你的项目
supabase link --project-ref <your-project-ref>

# 4. 执行迁移
supabase db push
```

---

## 📊 数据表结构说明

### 1️⃣ diary_raw（原始输入表）

存储用户的原始输入（语音转文字、图片等）。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID（关联 auth.users） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| input_type | TEXT | 输入类型：voice/text/image |
| raw_content | TEXT | 原始内容（语音转文字结果） |
| image_urls | TEXT[] | 图片 URL 数组 |
| metadata | JSONB | 元数据（date/title/mood/weather等） |

**用途**：
- 保存 Leon 的语音记录
- 保存拍摄的照片
- 作为 AI 整理的原始素材

---

### 2️⃣ diary_processed（整理后日记表）

存储 AI 整理后的完整图文日记。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| diary_date | DATE | 日记日期（唯一约束：每天一篇） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| title | TEXT | 日记标题 |
| content | TEXT | 日记正文（AI 整理后） |
| images | TEXT[] | 精选图片 |
| tags | TEXT[] | 标签数组（如 #深圳 #人才公园） |
| subject_links | TEXT[] | 学科链接（历史/科技/文化等） |
| mood | TEXT | 心情 emoji |
| weather | TEXT | 天气 emoji |
| location | TEXT | 地点 |
| ai_summary | TEXT | AI 摘要 |

**用途**：
- 展示给 Leon 和家长查看
- 支持搜索和浏览
- 关联夏令营行程和学科知识

---

## 🔒 安全策略

两个表都启用了 **Row Level Security (RLS)**：

- ✅ 用户只能查看自己的日记
- ✅ 用户只能插入/更新/删除自己的日记
- ✅ 完全隔离，保护隐私

---

## 🧪 测试数据（可选）

执行以下 SQL 插入测试数据：

```sql
-- 插入测试原始输入
INSERT INTO diary_raw (user_id, input_type, raw_content, metadata)
VALUES (
  'YOUR_USER_ID_HERE',
  'voice',
  '今天我去了人才公园，看到了好多高楼大厦，还有大草坪',
  '{"date": "2026-07-03", "title": "人才公园探险", "mood": "🤩", "weather": "☀️", "location": "深圳人才公园"}'
);

-- 插入测试整理后日记
INSERT INTO diary_processed (user_id, diary_date, title, content, tags, subject_links, mood, weather, location)
VALUES (
  'YOUR_USER_ID_HERE',
  '2026-07-03',
  '人才公园的科技奇迹',
  '今天是我来到深圳的第一天！我们去了人才公园，那里的建筑好高好高，像巨人一样耸立在天际线上。我看到了很多科技公司的大楼，感受到了深圳这座城市的创新力量。晚上还参加了开营仪式，认识了很多新朋友！',
  ARRAY['深圳', '人才公园', '科技'],
  ARRAY['历史', '科技', '文化'],
  '🤩',
  '☀️',
  '深圳人才公园'
);
```

---

## ✅ 验证清单

执行完 SQL 后，请确认：

- [ ] `diary_raw` 表已创建
- [ ] `diary_processed` 表已创建
- [ ] 索引已正确创建
- [ ] RLS 策略已启用
- [ ] 可以手动插入测试数据
- [ ] 可以通过 SQL Editor 查询数据

---

## 🐛 常见问题

### Q1: 提示 "relation already exists"
**A**: 表已经存在，可以跳过创建。如需重建，先执行 `DROP TABLE IF EXISTS ... CASCADE;`

### Q2: 提示 "permission denied"
**A**: 确保使用 project admin 权限执行 SQL

### Q3: 找不到表
**A**: 检查是否在正确的 Supabase 项目中执行

---

## 📞 需要帮助？

如果遇到任何问题，请告诉我！我会帮你解决。

---

## 🎉 下一步

数据库表创建完成后：

1. ✅ 代码已推送（commit `33add0c`）
2. ⏳ 等待 Zeabur 自动部署
3. 🔄 你需要在 Supabase Dashboard 执行 SQL 脚本
4. 🧪 测试日记功能（语音/文字/图片输入）
5. 🤖 后续添加 AI 整理功能
