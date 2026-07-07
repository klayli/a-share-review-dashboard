# Tasks

- [x] Task 1: 在 STOCK_INFO 中补全所有缺失的股票代码
  - 在 STOCK_INFO 对象末尾（约 line 3416 `};` 之前）添加 ~27 个新条目
  - 每个条目格式：`'CODE': { name:'名称', price:'—', prefix:'sh|sz' }`
  - 前缀规则：60/68/8/9 开头 → sh，00/30/15/12/16 开头 → sz

- [x] Task 2: 版本号更新 + 同步 + 预览
  - 更新 `APP_VERSION` 为 `v1.39.7`
  - 更新 `APP_VERSION_DATE`、`APP_RELEASE_NOTES`、`VERSION_HISTORY`
  - 同步文件：`cp a-share-review-dashboard.html site/index.html site/preview.html index.html`
  - 启动预览

# Task Dependencies

- Task 2 依赖 Task 1