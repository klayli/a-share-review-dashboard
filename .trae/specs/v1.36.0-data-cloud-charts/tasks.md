# v1.36.0 综合修复与增强 - 实现计划

## [x] Task 1: 补充早报数据（2026-07-03 和 2026-07-06）
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在MORNING_REPORTS对象中补充2026-07-03（周五）早报数据
  - 在MORNING_REPORTS对象中补充2026-07-06（周一）早报数据
  - 数据格式与现有条目一致，包含coreFocus、coreIndices、usStock、aShare、hkStock、macro、fx、crypto、news、calendar、outlook等模块
  - 2026-07-06数据需反映周末消息面+周一开盘前瞻
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 选择2026-07-06日期后，早报详情页显示完整的周一早报数据
  - `human-judgment` TR-1.2: 选择2026-07-03日期后，早报详情页显示完整的周五早报数据
- **Notes**: 参考现有早报条目格式（如2026-07-01），确保所有section都有内容

## [x] Task 2: 配置Cloudflare KV绑定，修复云端存储
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 更新`site/wrangler.toml`，添加KV命名空间绑定配置
  - 格式：`[[kv_namespaces]]` + `binding = "USER_DATA"` + `id = "xxx"`
  - 如果KV命名空间尚未创建，需在Cloudflare控制台创建
  - 确保`/api/user/data`端点能正确读写KV
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: wrangler.toml中包含正确的KV命名空间绑定配置
  - `programmatic` TR-2.2: 调用`/api/user/data` POST保存数据后，GET能返回相同数据
- **Notes**: 需要Cloudflare账号权限。用户已在规则中提供了API Token。

## [x] Task 3: 验证日期选择器倒序排列
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 验证`renderDateButtons()`中select元素已按日期倒序排列
  - 验证早报详情页的日期选择器也已倒序
  - 如有问题则修复
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 日期选择器下拉列表中新日期在最前面，旧日期在后面
  - `human-judgment` TR-3.2: 早报详情页日期选择器同样倒序

## [x] Task 4: 修复待办输入框密码提示问题
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 根因：`render()`每60秒被`checkRefresh`调用，重建整个DOM，input元素被重新创建，浏览器识别为"新表单"触发密码保存
  - 修复方案：在`renderHome()`和`renderTodoDetail()`中，不在render时重建todoInput的DOM，改用条件渲染或增量更新
  - 具体做法：将todoInput的HTML提取到render()之外，render()只更新数据列表部分，不重建input元素
  - 同时检查headerCustomInput是否也有同样问题
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 在待办清单输入框中输入文字后等待60秒，浏览器不弹出"保存密码"提示
  - `human-judgment` TR-4.2: 在顶部自定义输入框中输入文字后等待60秒，浏览器不弹出"保存密码"提示
- **Notes**: 关键修改点：renderHome()中todoInput的渲染逻辑、renderTodoDetail()中todoInput的渲染逻辑

## [x] Task 5: 实现ECharts K线图
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在HTML中引入ECharts CDN：`<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js">`
  - 修改`showTrend()`函数，用ECharts替代新浪GIF图片
  - 实现K线图渲染函数`renderKlineChart(code, range)`：
    - 调用东方财富K线API获取数据
    - 解析数据为ECharts candlestick格式
    - 计算MA5、MA10、MA30均线
    - 配置ECharts options（蜡烛图+均线+tooltip+dataZoom）
  - 修改`setTrendRange()`支持日K/周K/月K切换
  - 移除modalChart img元素，改为div容器
  - 保留"在东方财富查看详情"链接
  - 处理加载状态和错误降级
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `human-judgment` TR-5.1: 点击持仓股票名称后，弹窗显示ECharts K线图，能正常看到蜡烛图+MA均线
  - `human-judgment` TR-5.2: 切换周期（日K/周K/月K）后图表正确更新
  - `human-judgment` TR-5.3: 支持缩放、拖拽交互
  - `programmatic` TR-5.4: K线API请求失败时显示友好提示信息
- **Notes**: 东方财富K线API参数：secid格式为`1.000001`（上证）或`0.399001`（深证），klt=101为日K/102为周K/103为月K

## [x] Task 6: 版本号更新与部署同步
- **Priority**: medium
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5
- **Description**:
  - 更新APP_VERSION和APP_VERSION_DATE
  - 更新VERSION_HISTORY
  - 同步文件：`cp a-share-review-dashboard.html site/index.html && cp a-share-review-dashboard.html site/preview.html && cp a-share-review-dashboard.html index.html`
  - 更新site/versions.json和根目录versions.json
  - 部署到Cloudflare Pages
- **Acceptance Criteria Addressed**: AC-1 到 AC-7（全部）
- **Test Requirements**:
  - `programmatic` TR-6.1: 版本号正确更新
  - `programmatic` TR-6.2: site/index.html与主文件一致
  - `programmatic` TR-6.3: 部署成功

# Task Dependencies
- Task 6 depends on Task 1, 2, 3, 4, 5
- Tasks 1, 2, 3, 4, 5 相互独立，可并行执行