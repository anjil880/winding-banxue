# 问鼎铭校 — 小升初 AI 智能伴学系统

> 2000–3000 用户规模、轻量单体、前后端分离的全栈应用。

## 技术栈

- 后端：Node.js + NestJS + TypeScript + TypeORM + PostgreSQL
- 前端：Vue3 + Vite + TypeScript + Pinia + Vue Router
- 实时通信：Server-Sent Events (SSE)
- 部署：Docker Compose + Nginx + HTTPS

## 项目结构

```
.
├── backend/          # NestJS 后端
├── frontend/         # Vue3 前端
├── prototype/        # 已验收的静态原型（27 页）
├── docker-compose.yml
├── .env.example
└── README.md
```

## 本地开发启动

### 1. 准备环境

```bash
cp .env.example .env
# 编辑 .env，设置数据库密码、JWT 密钥等
```

### 2. 启动数据库

```bash
docker compose up -d db
```

### 3. 启动后端

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

## 生产部署

```bash
# 1. 配置 .env 与 SSL 证书（cert/ 目录）
# 2. 构建并启动
docker compose up -d --build
```

## 文档

- [开发计划 v3.0](./开发计划_v3.md)
- [系统架构方案](./系统架构方案.md)

## 许可证

私有项目，源码归项目方所有。
