# 微信小游戏榜单监测

内部自用的微信小游戏官方榜单监测与整理平台。从 [微信小游戏官网](https://xiaoyouxi.qq.com) **自动抓取**公开榜单，支持游戏图标展示、排名变化与增速分析。

## 功能

- **自动抓取**：每日从 xiaoyouxi.qq.com 公开页同步畅销榜、人气榜、畅玩榜（无需 MP 账号或 Cookie）
- **游戏图标**：榜单列表展示官方 icon（经代理加载），无 icon 时使用蓝色主题占位图
- **概览 / 榜单 / 增速 / 详情**：完整监测分析链路

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS 4
- Vercel Postgres（Neon）+ Drizzle ORM
- Recharts

## 快速开始

### 1. 创建数据库

在 [Vercel Dashboard](https://vercel.com) → 项目 → **Storage** → **Create Database** → 选 **Postgres**（底层为 Neon），创建后会自动注入 `POSTGRES_URL`。

本地开发：把 `POSTGRES_URL` 复制到 `.env.local`（从 Vercel 项目 Settings → Environment Variables 获取）。

### 2. 安装并启动

```bash
cp .env.example .env.local   # 填入 POSTGRES_URL
npm install
npm run db:seed              # 可选：写入 14 天示例数据
npm run fetch                # 抓取真实榜单（推荐）
npm run dev
```

## 自动抓取

数据来源：[xiaoyouxi.qq.com/rankdetail](https://xiaoyouxi.qq.com) 公开榜单页，无需任何账号配置。

**不需要每天手动抓。** 部署后由 Vercel Cron 每天自动调用 `/api/fetch`。

| 环境 | 方式 |
|------|------|
| 本地开发 | `npm run fetch` |
| Vercel 部署 | Cron 每天 **10:30（北京时间）** 自动抓取 |
| 手动触发 | `POST /api/fetch`（需 `CRON_SECRET` 授权） |

### Vercel 部署清单

1. GitHub 导入 Vercel 项目
2. **Storage → Postgres** 创建数据库（关联项目）
3. 环境变量设置 **`CRON_SECRET`**（随机字符串）
4. 部署 → 首次可手动 `npm run fetch` 或调 `/api/fetch` 写入数据
5. 之后 Cron 每天自动更新，数据持久保存在 Postgres

### 本地定时（可选）

```bash
30 10 * * * curl -X POST http://localhost:3000/api/fetch -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 概览 |
| `/rankings/bestseller` | 榜单（畅销/人气/畅玩） |
| `/rising` | 增速榜 |
| `/games/[id]` | 游戏详情 + 趋势 |

## API

- `POST /api/fetch` — 触发官方榜单抓取
- `GET /api/fetch` — 查看数据源与上次同步记录
- `POST /api/import` — 手动 JSON 导入（备用）
- `GET /api/proxy/image?url=...` — 微信 CDN 图标代理
