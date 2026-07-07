# Tasks

- [x] Task 1: 更新所有 hotThemes.stocks 为独立代表个股
  - [x] 1.1 读取 DAYS 数组中所有 `hotThemes` 条目，找出 `stocks` 与 `sectorHeat.leaders` 重复的条目
  - [x] 1.2 为每个热点题材生成独立的代表个股（前 3 只），与 `sectorHeat.leaders` 区分
  - [x] 1.3 确保每个 `stocks` 字段格式为 `名称(代码) · 名称(代码) · 名称(代码)`
  - [x] 1.4 涉及日期：6/30、7/1、7/2、7/3（共 8 处 stocks 更新）

- [x] Task 2: 版本号更新 + 同步
  - [x] 2.1 更新 `APP_VERSION` 为 `v1.39.5`，更新 `APP_VERSION_DATE`
  - [x] 2.2 更新 `APP_RELEASE_NOTES`
  - [x] 2.3 在 `VERSION_HISTORY` 头部添加 v1.39.5 记录
  - [x] 2.4 更新 `site/versions.json` 和 `versions.json`
  - [x] 2.5 同步文件到 `site/index.html`、`site/preview.html`、`index.html`
  - [x] 2.6 启动预览服务器

# Task Dependencies

- Task 2 依赖 Task 1 完成