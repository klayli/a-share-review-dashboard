# 动态财神像 + 金融市场早报模块 - Product Requirement Document

## Overview
- **Summary**: 在A股短线复盘看板页面顶部中间位置新增动态财神像图标；在首页新增"金融市场早报"卡片，并新增早报详情页及面包屑导航。早报内容涵盖隔夜外盘、要闻精选、今日关注、新股申购、市场日历等板块，UI风格与现有深色主题兼容。
- **Purpose**: 提升页面视觉趣味（财神像寓意招财进宝），补充盘前必读信息帮助用户快速掌握市场动态。
- **Target Users**: 使用A股短线复盘看板的投资者。

## Goals
- 在页面顶部header区域中间位置添加动态财神像emoji/icon，带有轻微动画效果（浮动/发光）
- 在首页home-grid中新增"金融市场早报"卡片（home-card风格）
- 新增金融市场早报详情页（morningReport），包含完整早报内容
- 在面包屑导航中新增"早报"入口
- 所有新内容与现有深色/亮色主题UI兼容

## Non-Goals (Out of Scope)
- 不接入实时早报API数据（使用内置示例数据，结构预留后续接入）
- 不修改现有持仓、大盘、待办、纪念日等模块逻辑
- 不做用户隔离的早报数据（早报为公共内容，所有用户可见）
- 不做早报内容编辑功能（管理员后续通过代码更新数据）

## Background & Context
- 项目是单文件HTML（`a-share-review-dashboard.html`），所有CSS/JS/HTML都在一个文件中
- 现有页面路由系统：`currentPage` 变量控制页面渲染，`render()` 函数分发
- 现有面包屑：`BREADCRUMB_SECTIONS` 数组定义，`buildBreadcrumbs()` 生成
- 现有首页卡片：使用 `.home-card` CSS类，在 `renderHome()` 中生成
- 现有header结构：flex布局，左侧标题/时间，右侧日期选择/主题/登录
- 财神像使用emoji或CSS绘制，避免引入外部图片资源
- 参考链接 `https://work.trae.cn/session/6a470b012cd16f0eb3d4b928` 为Trae内部会话，无法直接访问，早报内容按金融市场早报标准结构设计

## Functional Requirements
- **FR-1**: 页面顶部header中间位置显示动态财神像，带有呼吸/浮动动画效果
- **FR-2**: 财神像点击时有交互反馈（如金币粒子效果或弹跳动画）
- **FR-3**: 首页新增"金融市场早报"卡片，展示早报摘要（隔夜外盘3条+今日关注要点）
- **FR-4**: 点击早报卡片进入早报详情页，显示完整早报内容
- **FR-5**: 早报详情页包含板块：隔夜外盘、要闻精选、今日关注、新股/新债申购、财经日历、机构观点
- **FR-6**: 面包屑导航新增"早报"入口，可在各页面间切换
- **FR-7**: 在BREADCRUMB_SECTIONS中添加morningReport项，isHideAnni用户也不隐藏早报面包屑
- **FR-8**: 早报数据按日期存储在DAYS数组中（day.morningReport），历史日期显示对应日期的早报
- **FR-9**: 亮色/暗色主题下财神像和早报样式均正常显示

## Non-Functional Requirements
- **NFR-1**: 财神像动画使用CSS animation，性能流畅，不阻塞页面渲染
- **NFR-2**: 所有CSS内联在现有`<style>`块中，不引入外部资源
- **NFR-3**: 单文件修改，不新增外部依赖
- **NFR-4**: 适配现有响应式布局（移动端正常显示）

## Constraints
- **Technical**: 单HTML文件，纯原生JS/CSS，无框架依赖
- **Business**: 早报数据为静态示例数据，结构设计便于后续维护更新
- **Dependencies**: 无外部依赖

## Assumptions
- 财神像使用emoji `🧧` 或 `💰` 或 `🀄` 组合，或CSS绘制一个卡通财神头像
- 早报数据结构设计为可扩展，后续接入API时只需替换数据源
- 2233账号（hideAnni）可以看到早报模块（仅隐藏纪念日，不隐藏早报）

## Acceptance Criteria

### AC-1: 财神像显示在顶部中间
- **Given**: 页面已加载
- **When**: 用户查看任何页面
- **Then**: header区域中间位置显示财神像icon，带有浮动/呼吸动画效果
- **Verification**: `human-judgment`

### AC-2: 财神像交互动画
- **Given**: 财神像可见
- **When**: 用户点击财神像
- **Then**: 财神像有弹跳/发光等反馈动画
- **Verification**: `human-judgment`

### AC-3: 首页早报卡片
- **Given**: 用户在首页
- **When**: 页面加载完成
- **Then**: home-grid中显示"金融市场早报"卡片，包含早报摘要内容和"查看详情"按钮
- **Verification**: `human-judgment`

### AC-4: 早报详情页
- **Given**: 用户点击早报卡片或面包屑"早报"
- **When**: 进入早报详情页
- **Then**: 显示完整早报内容，包含隔夜外盘、要闻精选、今日关注、新股申购、财经日历、机构观点板块
- **Verification**: `human-judgment`

### AC-5: 面包屑导航
- **Given**: 用户在任何页面
- **When**: 查看面包屑导航
- **Then**: 面包屑中包含"早报"入口，点击可跳转到早报详情页
- **Verification**: `human-judgment`

### AC-6: 历史日期早报
- **Given**: 用户切换到历史日期
- **When**: 查看早报
- **Then**: 显示该日期对应的早报内容（如无数据则显示"当日暂无早报"）
- **Verification**: `programmatic`

### AC-7: 主题兼容
- **Given**: 用户切换亮色/暗色主题
- **When**: 查看财神像和早报
- **Then**: 样式正常，无颜色异常
- **Verification**: `human-judgment`

### AC-8: 2233账号可见早报
- **Given**: 用户以2233账号登录
- **When**: 查看首页和面包屑
- **Then**: 早报卡片和面包屑"早报"入口可见，纪念日仍隐藏
- **Verification**: `programmatic`

## Open Questions
- [ ] 财神像具体样式偏好：emoji风格 vs CSS绘制 vs SVG？默认使用emoji组合（更轻量）
- [ ] 早报内容是否需要管理员可编辑？当前版本使用静态数据，后续可扩展
- [ ] 参考链接无法访问，早报内容板块按标准金融早报结构设计，如有调整请告知
