# 部署指南

本指南将帮助你将前端部署到 Vercel。

## Vercel 部署步骤

### 1. Vercel 项目设置

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "Add New" → "Project"
3. 选择你的 GitHub 仓库
4. 配置项目设置：
   - **Framework Preset**: Vite
   - **Root Directory**: `bookkeeping-frontend`

### 2. 配置环境变量

在 Vercel 项目的 "Settings" → "Environment Variables" 中添加：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `VITE_API_BASE_URL` | `https://your-railway-backend-url.up.railway.app/api` | 你的 Railway 后端 URL |

**重要**：必须在部署前配置好 `VITE_API_BASE_URL`，因为 Vite 会在构建时替换环境变量。

### 3. 部署

1. 点击 "Deploy" 按钮
2. 等待部署完成

## 配置 Rewrite（可选）

如果需要将 `/api` 请求代理到后端，可以在 Vercel 的 `vercel.json` 中配置：

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url.up.railway.app/api/$1" }
  ]
}
```

## 验证部署

部署完成后，访问你的 Vercel URL，测试以下功能：
- 用户登录/注册
- 创建记账任务
- 添加收支记录
- 上传附件

## 常见问题

### 前端无法访问后端

- 检查 `VITE_API_BASE_URL` 是否正确配置
- 确保后端已成功部署
- 检查 CORS 配置

### 构建失败

- 确保所有依赖已正确安装
- 检查 package.json 配置
- 查看 Vercel 构建日志

### 环境变量未生效

- 确保在部署前配置了环境变量
- 如果已部署，需要重新部署才能生效
