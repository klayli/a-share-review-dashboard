# Tasks

- [x] Task 1: 修复版本通知按钮崩溃
  - [x] 1.1 将 `VERSION_HISTORY` v1.39.6 条目 `desc` 改为 `notes`
  - [x] 1.2 在 `formatNotes` 函数中添加防御性检查（`(notes || '').split('；')`）

- [x] Task 2: 实现热点题材动态去重
  - [x] 2.1 新增 `dedupStocks(apiStocks, sectorHeatLeaders)` 函数
  - [x] 2.2 修改 `renderMarket()` 为 async，对每个带 `bkCode` 的 hotTheme 动态 fetch
  - [x] 2.3 修改 `renderThemeCard()` 支持异步 stocks 更新
  - [x] 2.4 确保所有调用 `renderMarket()` 的地方使用 `await`

- [x] Task 3: 版本号更新 + 同步 + 预览
  - [x] 3.1 更新 `APP_VERSION` 为 `v1.40.1`
  - [x] 3.2 更新版本记录和 `versions.json`
  - [x] 3.3 同步文件并启动预览

# Task Dependencies

- Task 2 依赖 Task 1（同一文件，建议一起修改）