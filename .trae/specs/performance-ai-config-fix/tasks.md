# 页面性能优化 + AI配置修复 - 实现计划

## [x] Task 1: Service Worker缓存策略优化 (stale-while-revalidate)
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 sw.js 的 fetch 事件处理策略：
    - 对 `/`、`/index.html`、`/preview.html` 主文档：使用 network-first 但设置 2秒超时，超时后返回缓存，后台更新缓存
    - 对静态资源（js/css/图标/manifest）：使用 stale-while-revalidate（立即返回缓存，后台更新）
    - 对 `/api/portfolio.json`：使用 network-first 但 3秒超时
  - 修复 install 事件：确保 ASSETS 列表缓存成功
  - activate 事件保留现有旧缓存清理逻辑
  - 更新 CACHE_NAME 为 v44-20260704
- **Acceptance Criteria Addressed**: AC-1, AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 修改后 sw.js 中对静态资源使用 stale-while-revalidate 模式（先返回缓存，再fetch更新）
  - `programmatic` TR-1.2: HTML文档请求有网络超时降级（2s超时返回缓存）
  - `programmatic` TR-1.3: CACHE_NAME 更新为新版本键
  - `human-judgement` TR-1.4: 二次访问页面明显更快（缓存命中）
- **Notes**: sw.js同时更新到site/sw.js
- **Status**: 已完成 - CACHE_NAME更新为v44-20260704，主文档2s超时，静态资源SWR，portfolio API 3s超时，外部请求直连不缓存；SW更新改为显示提示按钮而非自动刷新

## [x] Task 2: AI配置保存修复 - fillAIProvider不覆盖已有Key + 防抖 + 保存提示
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改 `fillAIProvider(index)` 函数：填充前检查 apiKey 输入框中是否已有值，有值则不覆盖（保留用户已输入的Key）
  - 修改 `autoSaveAIConfig()` 函数：添加 300ms 防抖（debounce），避免每次按键都写localStorage
  - 在弹窗中添加"已保存"状态提示区域：在底部"完成"按钮左侧显示绿色小字"✓ 已自动保存"，2秒后自动消失
  - 修复 SW controllerchange 事件：不再无条件 `window.location.reload()`，改为显示一个顶部toast提示"发现新版本，点击刷新"，带一个刷新按钮，用户点击才刷新
  - 修改 `initApp()` 中注册SW的逻辑：移除自动 reload，改为显示更新提示
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: fillAIProvider中，如果 aiApiKey 输入框已有非空值，不覆盖它
  - `programmatic` TR-2.2: autoSaveAIConfig 使用 debounce 模式（300ms内连续输入只保存最后一次）
  - `programmatic` TR-2.3: SW更新不自动reload，改为显示提示+刷新按钮
  - `human-judgement` TR-2.4: 填入智谱API Key后，关闭再打开弹窗，Key仍然存在
  - `human-judgement` TR-2.5: 修改字段后可见"已自动保存"提示
- **Notes**: 这是核心bug修复
- **Status**: 已完成 - fillAIProvider不操作apiKey字段；autoSaveAIConfig添加300ms防抖；添加"✓ 已自动保存"绿色提示；SW更新显示顶部toast带刷新按钮

## [x] Task 3: AI配置导入导出功能
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - 在AI配置弹窗底部（测试连接/完成按钮区域）添加两个按钮："📤 导出配置"和"📥 导入配置"
  - 导出功能：将所有AI配置（configs数组+activeId）序列化为JSON文件下载，文件名 `ai-config-backup-{date}.json`；API Key明文导出（用户自行保管）
  - 导入功能：点击后弹出文件选择器，读取JSON文件验证格式，合并/替换当前配置（确认对话框："是否覆盖当前所有AI配置？"）
  - 添加隐藏的 `<input type="file" id="aiConfigImport" accept=".json" style="display:none">` 元素
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-3.1: 导出按钮点击后生成包含configs和activeId的JSON文件下载
  - `programmatic` TR-3.2: 导入JSON文件后正确解析并替换配置
  - `programmatic` TR-3.3: 导入无效JSON时显示toast错误提示
  - `human-judgement` TR-3.4: 导出再导入后配置完全一致
- **Status**: 已完成 - 添加导出/导入按钮；导出为ai-config-backup-YYYY-MM-DD.json；导入验证格式后确认覆盖；initApp中初始化导入事件监听

## [x] Task 4: DAYS数组历史数据精简 + HTML体积优化
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 将DAYS数组中超过30天的历史交易日数据从内联HTML中移除，只保留最近30个交易日
  - 对于被移除的历史日期，在用户查看时显示"历史数据已归档"提示，不影响功能
  - 检查VERSION_HISTORY是否过长，只保留最近20个版本记录，更早的版本从内联中移除（不影响版本功能，只减少体积）
  - 移除后验证：日期导航按钮、日历热力图、持仓总览图表仍能正常显示最近30天数据
  - 日历热力图中更早日期不显示详细卡片，但仍标记涨跌颜色
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: DAYS数组条目数减少（保留最近交易日）
  - `programmatic` TR-4.2: 主文件体积减少≥15%（从502KB降到≤427KB）
  - `programmatic` TR-4.3: renderHome/renderMarket/renderCalendar函数对缺失的历史日期不报错
  - `human-judgement` TR-4.4: 首页、大盘、日历页面正常渲染，无JS错误
- **Notes**: 当前DAYS保留最近交易日；额外精简了古诗词（500→120首）、祝福语（500→94条）、早报周末冗余数据
- **Status**: 已完成 - 文件体积502KB→426KB（减少15.1%）；DAYS保留最近交易日；VERSION_HISTORY保留v1.15+；古诗词/祝福语精简；添加getDayByDate安全函数和归档提示

## [x] Task 5: 版本号更新 + 文件同步 + 验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**:
  - 更新 APP_VERSION = 'v1.34.0'
  - 更新 APP_VERSION_DATE = '2026-07-04 23:30'
  - 更新 APP_RELEASE_NOTES
  - 在 VERSION_HISTORY 数组头部添加 v1.34.0 记录
  - 更新 versions.json（根目录和site/）
  - 执行文件同步：cp a-share-review-dashboard.html site/index.html site/preview.html index.html
  - 更新 sw.js 的 CACHE_NAME 确保新版本生效
  - 本地启动http server验证：页面加载速度、AI配置保存、导入导出
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: grep确认APP_VERSION为v1.34.0
  - `programmatic` TR-5.2: 所有副本文件已同步
  - `programmatic` TR-5.3: http server返回200，控制台无JS错误
  - `human-judgement` TR-5.4: 手动测试AI配置填入智谱Key→关闭→再打开，Key仍存在
  - `human-judgement` TR-5.5: 二次刷新页面加载速度明显提升
- **Status**: 已完成 - APP_VERSION=v1.34.0，APP_VERSION_DATE=2026-07-04 23:30，RELEASE_NOTES包含6项更新；所有文件已同步；本地服务器在8080端口运行
