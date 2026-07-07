# Tasks

- [x] Task 1: 创建 Cloudflare Worker 定时任务
  - [x] 1.1 创建 `worker/` 目录，编写 `wrangler.toml` 配置（Cron trigger: `30 22 * * 1-5` 即 UTC 22:30 = CST 8:30）
  - [x] 1.2 编写 `worker/src/index.js`：交易日判断逻辑（周末+节假日排除）
  - [x] 1.3 集成东方财富 API 数据拉取（美股/港股/A股指数/商品/外汇）
  - [x] 1.4 集成 AI 接口生成早报文字内容（核心关注/要闻精选/风险提示）
  - [x] 1.5 将生成的早报 JSON 写入 KV namespace
  - [x] 1.6 添加 KV 读取端点（`/api/morning/:date`），供前端 fetch

- [x] Task 2: 修改前端 getMorningReport() 函数
  - [x] 2.1 优先从 `/api/morning/{date}.json` 获取 KV 数据
  - [x] 2.2 无 KV 数据时 fallback 到 `MORNING_REPORTS[date]` 静态数据
  - [x] 2.3 自动生成的早报增加"AI 生成"标记

- [x] Task 3: 版本号更新 + 同步 + 预览
  - [x] 3.1 更新 `APP_VERSION` 为 `v1.40.0`
  - [x] 3.2 更新版本记录和 `versions.json`
  - [x] 3.3 同步文件并启动预览

# Task Dependencies

- Task 2 依赖 Task 1（需要 Worker 部署并提供 KV API）
- Task 3 依赖 Task 1, 2