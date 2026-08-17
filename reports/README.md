# 客户报告模版

按当前商务服务内容生成统一 Markdown 报告，便于微信发放或再转 PDF。

## 服务对应章节

| 服务 | 报告 |
|------|------|
| 每日游戏报告 | 日报 · 第一章 |
| 指定游戏榜单报告（每日） | 日报 · 第二章（`watchGames`） |
| 指定竞品报告（每日） | 日报 · 第三章（`competitors`） |
| 数据分析 | 日报 / 周报末章 |
| 每周游戏报告 | 周报 · 第一章 |
| 热搜词 / IP 周报 | 周报 · 第二章 |

## 1. 配置客户

复制 `reports/clients/example.json`，改成真实客户，例如 `reports/clients/acme.json`：

```json
{
  "clientId": "acme",
  "clientName": "某某互娱",
  "platform": "wechat",
  "rankType": "bestseller",
  "watchGames": [101, 102],
  "competitors": [201, 202],
  "notes": "单端 · 畅销榜"
}
```

- `platform`：`wechat` | `douyin` | `both`
- `watchGames` / `competitors`：库内 `games.id`（可在站内游戏详情 URL `/games/[id]` 查看）
- 生成前请确保已抓取数据：`npm run fetch`（微信），双端再加 `npm run fetch:douyin`

## 2. 生成报告

```bash
# 空白版式模版（不读库）
npm run report -- --blank=daily
npm run report -- --blank=weekly

# 按客户配置灌数
npm run report -- --client=example --kind=daily
npm run report -- --client=example --kind=weekly
npm run report -- --client=example --kind=daily --date=2026-08-17
```

输出目录：`reports/out/`

## 3. 转 PDF（可选）

本机安装 [pandoc](https://pandoc.org/) 后：

```bash
pandoc reports/out/2026-08-17_example_daily.md -o reports/out/2026-08-17_example_daily.pdf
```

也可把 Markdown 粘贴到飞书文档 / Typora / Notion 再导出 PDF。

## 5. 管理后台（推荐）

打开 `/admin`，用账号密码登录后可：

- 保存客户配置（平台、关注游戏、竞品）
- 一键生成日报 / 周报并下载 **Word（.docx）**
- 关注/竞品支持 **游戏 ID 或游戏名**

默认账号见 `.env.example`（`ADMIN_USERNAME` / `ADMIN_PASSWORD`）。
