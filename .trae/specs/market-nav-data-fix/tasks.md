# Tasks

- [x] Task 1: 修复 renderThemeCard() pct 空值崩溃
  - [x] 1.1 在 `renderThemeCard()` 函数（line 8978-8988）中添加 `t.pct` 空值检查
  - [x] 1.2 当 `t.pct` 为 undefined 时，显示"—"
  - [x] 1.3 确保 `pctStr` 变量仅在 `t.pct` 存在时计算

- [x] Task 2: 修正 DAYS 7/6 和 7/7 真实指数数据
  - [x] 2.1 修正 7/6 条目：`idx` 改为 `{ sh: [4041.24, -0.06], sz: [15416.80, -1.16], cy: [3948.86, -1.77] }`，描述字段更新
  - [x] 2.2 修正 7/7 条目：`idx` 改为 `{ sh: [3990.24, -1.26], sz: [15225.11, -1.24], cy: [3911.91, -0.94] }`，描述字段更新
  - [x] 2.3 更新 `price` 和 `prev` 字段
  - [x] 2.4 更新 `theme`、`themeDesc`、`summary`、`sentiment`、`strength`、`direction` 等描述字段

- [x] Task 3: 版本号更新 + 同步
  - [x] 3.1 更新 `APP_VERSION` 为 `v1.39.4`，更新 `APP_VERSION_DATE`
  - [x] 3.2 更新 `APP_RELEASE_NOTES`
  - [x] 3.3 在 `VERSION_HISTORY` 头部添加 v1.39.4 记录
  - [x] 3.4 更新 `site/versions.json` 和 `versions.json`
  - [x] 3.5 同步文件到 `site/index.html`、`site/preview.html`、`index.html`
  - [x] 3.6 启动预览服务器

# Task Dependencies

- Task 1, Task 2 互不依赖，可并行执行
- Task 3 依赖 Task 1, 2 全部完成