# 动态财神像 + 金融市场早报模块 - The Implementation Plan

## [x] Task 1: 添加动态财神像到页面顶部中间
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改header HTML结构（约line 522-544），在左侧标题区和右侧日期选择区之间新增财神像容器
  - 添加CSS动画样式（浮动+呼吸发光效果），点击时弹跳动画
  - 财神像使用emoji组合（🧧+💰）或CSS绘制，避免外部资源依赖
  - 财神像响应式适配：移动端适当缩小
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-7
- **Test Requirements**:
  - `human-judgement` TR-1.1: 财神像在header中间位置显示，有浮动/呼吸动画
  - `human-judgement` TR-1.2: 点击财神像有弹跳/发光反馈
  - `human-judgement` TR-1.3: 暗色/亮色主题下财神像样式正常
  - `human-judgement` TR-1.4: 移动端（窄屏）财神像不遮挡其他元素

## [x] Task 2: 添加早报数据结构和示例数据
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在常量区域（约line 870附近DAYS定义之前/之后）添加早报数据结构定义
  - 定义`MORNING_REPORT_TEMPLATE`数据结构，包含板块：overseas（隔夜外盘）、headlines（要闻精选）、focus（今日关注）、ipo（新股申购）、calendar（财经日历）、views（机构观点）
  - 在DAYS数组的每个day对象中为最近日期添加morningReport字段，填入示例数据
  - 为历史日期不填morningReport（显示"暂无早报"）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: DAYS数组中当日有morningReport数据且结构完整
  - `programmatic` TR-2.2: 历史日期无morningReport时不报错

## [x] Task 3: 添加面包屑导航和路由
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在BREADCRUMB_SECTIONS中添加`{ key: 'morningReport', label: '早报', action: 'goMorningReport()' }`
  - 添加`goMorningReport()`路由函数
  - 修改buildBreadcrumbs()中hideAnni过滤逻辑：不过滤morningReport
  - 在render()分发函数中添加`else if (currentPage === 'morningReport') renderMorningReport()`
- **Acceptance Criteria Addressed**: AC-5, AC-8
- **Test Requirements**:
  - `programmatic` TR-3.1: BREADCRUMB_SECTIONS包含morningReport项
  - `programmatic` TR-3.2: goMorningReport()函数存在且正确设置currentPage
  - `programmatic` TR-3.3: 2233账号(hideAnni)面包屑中仍显示早报入口

## [x] Task 4: 首页早报卡片
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - 在renderHome()的home-grid中添加"金融市场早报"卡片（Card 5位置，在纪念日卡片之后）
  - 卡片显示：标题"金融市场早报"+日期、隔夜外盘摘要（道琼斯/纳斯达克/标普涨跌）、要闻精选前2条、"查看详情"按钮
  - 卡片点击跳转到早报详情页
  - 使用与现有home-card一致的样式类
  - 如果当日无早报数据，卡片显示"当日早报待更新"提示
- **Acceptance Criteria Addressed**: AC-3, AC-6, AC-7
- **Test Requirements**:
  - `human-judgement` TR-4.1: 首页显示早报卡片，样式与其他卡片一致
  - `human-judgement` TR-4.2: 点击卡片跳转到早报详情页
  - `human-judgement` TR-4.3: 无早报数据的日期显示提示信息

## [x] Task 5: 早报详情页
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - 实现renderMorningReport()函数，渲染完整早报详情页
  - 页面顶部：返回首页按钮+面包屑+早报标题+日期
  - 各板块使用section/card样式渲染：
    - 隔夜外盘：美股三大指数、欧洲主要指数、亚太市场、大宗商品、汇率（表格/卡片网格展示）
    - 要闻精选：5-8条重要新闻，带标签（宏观/行业/政策）
    - 今日关注：3-5个需要重点关注的事件或机会
    - 新股/新债申购：表格展示当日可申购标的
    - 财经日历：重要经济数据发布时间
    - 机构观点：2-3家机构最新策略观点
  - 添加早报专属CSS样式（report-section, report-tag, report-grid等），复用现有CSS变量
- **Acceptance Criteria Addressed**: AC-4, AC-7
- **Test Requirements**:
  - `human-judgement` TR-5.1: 早报详情页各板块完整显示
  - `human-judgement` TR-5.2: 样式与现有页面深色/亮色主题兼容
  - `human-judgement` TR-5.3: 返回按钮和面包屑正常工作

## [x] Task 6: 版本号更新+同步文件+本地预览验证
- **Priority**: high
- **Depends On**: Task 1-5
- **Description**:
  - 更新APP_VERSION为v1.25.0，更新APP_VERSION_DATE
  - APP_RELEASE_NOTES设为"修复了一些问题和BUG。"
  - VERSION_HISTORY头部添加v1.25.0记录
  - 更新versions.json
  - 同步文件到site/目录和根目录
  - 启动本地服务器预览验证
- **Acceptance Criteria Addressed**: AC-1 through AC-8
- **Test Requirements**:
  - `human-judgement` TR-6.1: 本地预览所有功能正常
  - `programmatic` TR-6.2: 版本号正确更新
