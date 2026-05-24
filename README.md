# 记账应用前端

Vue 3 前端应用，提供现代化的用户界面。

## 技术栈

- Vue 3
- Vite
- Element Plus
- Vue Router
- Pinia

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.development`：

```bash
cp .env.example .env.development
# 编辑 .env.development 文件
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080/api` |

## 生产环境构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 部署

部署到 Vercel：

1. 在 Vercel 创建项目，选择此仓库
2. 配置环境变量 `VITE_API_BASE_URL`
3. 部署

详细部署指南请参考 [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

## 项目结构

```
src/
├── api/          # API 请求
├── components/   # 组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── utils/        # 工具函数
├── views/        # 页面视图
├── App.vue       # 根组件
├── main.js       # 入口文件
└── style.css     # 全局样式
```
