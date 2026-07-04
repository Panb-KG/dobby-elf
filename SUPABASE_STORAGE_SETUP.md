# 📸 Supabase Storage 设置指南（魔法日记图片）

## 🎯 目标
在 Supabase 中创建 `diary-images` Storage Bucket，用于存储日记图片。

---

## 🚀 执行步骤

### 方法 1: Supabase Dashboard（推荐）

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **进入 Storage**
   - 左侧菜单 → **Storage**

3. **创建新 Bucket**
   - 点击 **New bucket**
   - Bucket name: `diary-images`
   - Public: ✅ **勾选**（公开访问）
   - 点击 **Create bucket**

4. **配置 CORS（如果需要）**
   - 点击 Bucket 名称进入详情
   - 点击右上角 **...** → **Configure CORS**
   - 添加规则：
     ```json
     [
       {
         "AllowedOrigins": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```

5. **配置 RLS 策略**
   - 在 Bucket 详情页，点击 **Policies** 标签
   - 点击 **New policy** → **For full customization**
   
   **读取策略**（任何人可查看）：
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'diary-images');
   ```

   **上传策略**（仅认证用户）：
   ```sql
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'diary-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **删除策略**（仅所有者可删除）：
   ```sql
   CREATE POLICY "Users can delete their own files"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'diary-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

### 方法 2: SQL Editor（快速）

直接在 **SQL Editor** 中执行以下 SQL：

```sql
-- 1. 创建 Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('diary-images', 'diary-images', true);

-- 2. 启用 RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. 创建读取策略（公开）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'diary-images');

-- 4. 创建上传策略（仅认证用户，且文件夹名匹配 user_id）
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'diary-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 创建删除策略（仅所有者）
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'diary-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📊 Bucket 结构说明

```
diary-images/
├── {user_id_1}/
│   ├── 1720000000_abc123.jpg
│   ├── 1720000001_def456.png
│   └── ...
├── {user_id_2}/
│   ├── 1720000002_ghi789.jpg
│   └── ...
└── ...
```

**文件命名规则**：
- 格式：`{user_id}/{timestamp}_{randomStr}.{ext}`
- 示例：`a1b2c3d4-e5f6-7890-abcd-ef1234567890/1720000000_abc123.jpg`

**优点**：
- ✅ 按用户隔离，便于管理
- ✅ 时间戳排序，方便查找
- ✅ 随机字符串避免冲突

---

## 🔒 安全策略

| 操作 | 权限 | 说明 |
|------|------|------|
| 读取 | 公开 | 任何人都可以查看图片 |
| 上传 | 认证用户 | 只能上传到自己的文件夹（user_id/） |
| 删除 | 所有者 | 只能删除自己上传的图片 |

---

## ✅ 验证清单

创建完成后，请确认：

- [ ] `diary-images` Bucket 已创建
- [ ] Bucket 设置为公开（Public）
- [ ] RLS 策略已配置
- [ ] 可以手动上传图片测试
- [ ] 图片 URL 可以公开访问

---

## 🧪 测试上传

1. 在 Storage 页面选择 `diary-images` Bucket
2. 点击 **Upload**
3. 选择一个测试图片
4. 上传成功后，复制图片 URL
5. 在浏览器中打开 URL，确认可以访问

---

## 🐛 常见问题

### Q1: 提示 "Bucket already exists"
**A**: Bucket 已经存在，可以跳过创建步骤，直接配置策略。

### Q2: 图片上传失败
**A**: 检查：
- Bucket 是否设置为公开
- RLS 策略是否正确配置
- 文件大小是否超过限制（默认 10MB）

### Q3: 图片无法访问
**A**: 确保：
- Bucket 的 Public 选项已勾选
- 图片 URL 格式正确
- 没有防火墙或网络限制

---

## 🎉 下一步

Bucket 创建完成后：

1. ✅ 代码已包含图片上传功能
2. ⏳ 等待 Zeabur 部署
3. 🧪 测试图片上传功能
4. 🤖 后续添加 AI 整理功能

---

## 📞 需要帮助？

如果遇到任何问题，请告诉我！
