# Tasks

- [ ] Task 1: 修复面包屑导航
  - [ ] 1.1 修改 `buildBreadcrumbs()` 函数（line 4464），`<a onclick="...">` → `<a href="javascript:void(0)" onclick="...">`
  - [ ] 1.2 检查早报渲染中所有 `<a class="report-anchor" onclick="...">` 锚点标签，添加 `href="javascript:void(0)"`
  - [ ] 1.3 全局搜索其他 `<a onclick="...">` 缺少 `href` 的标签并修复

- [ ] Task 2: 添加 7月7日早报数据
  - [ ] 2.1 在 `MORNING_REPORTS` 对象中添加 `'2026-07-07'` 条目
  - [ ] 2.2 包含：市场概况、热门股票、今日预测、新闻来源
  - [ ] 2.3 更新 `allReportDates` 数组确保新日期包含在内

- [ ] Task 3: 移除持仓卡片点击弹窗
  - [ ] 3.1 证券持仓卡片：移除 `onclick="showTrend('${s.code}')"`（line 9069）
  - [ ] 3.2 基金持仓卡片：移除 `onclick="showFundDetail('${f.code}')"`（line 9122）

- [ ] Task 4: 版本号更新 + 同步 + 部署
  - [ ] 4.1 更新 `APP_VERSION` 为 `v1.39.1`，更新 `APP_VERSION_DATE` 为 `2026-07-07`
  - [ ] 4.2 更新 `APP_RELEASE_NOTES`
  - [ ] 4.3 在 `VERSION_HISTORY` 头部添加 v1.39.1 记录
  - [ ] 4.4 更新 `site/versions.json` 和 `versions.json`
  - [ ] 4.5 同步文件到 `site/index.html`、`site/preview.html`、`index.html`
  - [ ] 4.6 部署到 Cloudflare Pages

# Task Dependencies

- Task 1, Task 2, Task 3 互不依赖，可并行执行
- Task 4 依赖 Task 1, 2, 3 全部完成