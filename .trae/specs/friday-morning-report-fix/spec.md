# v1.32.2 周五数据完整更新 - Product Requirement Document

## Overview
- **Summary**: 整合v1.32.1的bug修复和数据补充（本地已有但线上未生效），并将7月3日金融市场早报从盘前版更新为周五收盘版，版本升级至v1.32.2，本地预览确认后部署。
- **Purpose**: 线上v1.32.0完全没有7月3日（周五）数据——持仓总览、大盘情绪、早报均停留在周四数据。大盘情绪详情页还存在renderThemeCard空指针崩溃bug。需一次性修复所有问题。
- **Target Users**: 使用A股短线复盘看板的投资者用户。

## Goals
- 更新MORNING_REPORTS['2026-07-03']为周五收盘后版本（超跌反弹行情）
- 确认DAYS数组7月3日数据和renderThemeCard修复已在本地代码中就绪
- 版本号更新至v1.32.2，版本说明涵盖所有修复
- 本地预览验证：持仓/大盘/早报三个卡片均显示周五数据且互相一致
- 用户确认后再部署到线上

## Non-Goals (Out of Scope)
- 不新增7月4日（周六）数据
- 不修改其他日期的早报或DAYS数据
- 不修改渲染逻辑或样式
- 未经用户确认不部署

## Background & Context
- 线上环境（a-share-review-dashboard.pages.dev）运行v1.32.0，日期选择器最新到2026-07-02周四
- 本地代码已包含v1.32.1的修改（renderThemeCard空安全修复、DAYS数组7月3日周五数据），但之前部署未更新到主域名
- 7月3日（周五）A股行情：超跌反弹，上证+0.77%收复4060，深证+0.78%，创业板+0.44%；涨停120家/跌停20家
- 周五港股：恒生科技指数+3.23%大幅反弹
- 隔夜美股（周四晚）：道指+1.14%创历史新高52,900，纳指-0.80%（道强纳弱）
- 黄金：非农爆冷后V型反转+2.30%至$4,123

## Functional Requirements
- **FR-1**: 更新MORNING_REPORTS['2026-07-03']所有板块为周五收盘后版本
  - coreIndices: A股为4060+0.77%/15620+0.78%/4035+0.44%，恒生科技4,598+3.23%
  - coreFocus: 周五核心关注（超跌反弹、非农爆冷、黄金V型反转、港股恒科大反弹等）
  - coreAlert: 周五收盘后重点提示
  - aShare: 超跌反弹行情回顾（而非周四暴跌）
  - hkStock: 恒生科技+3.23%（而非-0.40%）
  - news: 周五相关新闻
  - calendar: 下周一（7月6日）经济日历
  - outlook: 周末/下周一视角
- **FR-2**: 确认DAYS数组7月3日周五数据完整（本地已有，验证即可）
- **FR-3**: 确认renderThemeCard空安全修复生效（本地已有，验证即可）
- **FR-4**: APP_VERSION更新至v1.32.2，APP_RELEASE_NOTES和VERSION_HISTORY更新
- **FR-5**: versions.json同步更新
- **FR-6**: 同步所有文件副本（site/index.html, site/preview.html, index.html）
- **FR-7**: 本地HTTP服务器启动并验证

## Non-Functional Requirements
- **NFR-1**: 数据一致性：首页三个卡片（持仓、大盘、早报）的周五数据互相一致
- **NFR-2**: 无JavaScript错误：点击所有详情页无崩溃
- **NFR-3**: 不破坏其他日期数据和功能

## Constraints
- **Technical**: 单HTML文件架构
- **Business**: 必须先本地预览，用户确认后才部署
- **Dependencies**: 依赖DAYS数组中已有的7月3日数据作为基准

## Assumptions
- 本地DAYS数组和renderThemeCard修复是正确的（已在v1.32.1中验证过）
- 美股/黄金/加密货币数据保持不变（周四隔夜数据是周五凌晨收盘的实际数据）

## Acceptance Criteria

### AC-1: 首页三个卡片均显示周五数据
- **Given**: 用户访问首页，日期选择器选到2026-07-03周五
- **When**: 页面加载完成
- **Then**: 大盘情绪卡片显示上证4060.00 +0.77%；早报卡片上证指数+0.77%；持仓总览数据更新时间显示2026-07-03收盘后
- **Verification**: `human-judgment`

### AC-2: 大盘情绪详情页可正常进入
- **Given**: 用户从首页点击大盘情绪卡片或面包屑
- **When**: 进入大盘情绪详情页
- **Then**: 页面正常渲染，板块热力图和热点题材显示，无TypeError崩溃
- **Verification**: `programmatic`

### AC-3: 早报详情页港股恒生科技+3.23%
- **Given**: 用户进入早报详情页
- **When**: 查看港股板块
- **Then**: 恒生科技指数显示+3.23%（绿色），描述港股大幅反弹
- **Verification**: `programmatic`

### AC-4: 早报A股板块反映超跌反弹
- **Given**: 用户查看早报A股板块
- **When**: 阅读内容
- **Then**: 描述超跌反弹而非暴跌，涨停120家左右
- **Verification**: `human-judgment`

### AC-5: 版本号为v1.32.2
- **Given**: 页面加载完成
- **When**: 查看页面底部
- **Then**: 显示v1.32.2
- **Verification**: `programmatic`

### AC-6: 本地预览可访问无错误
- **Given**: 本地HTTP服务器已启动
- **When**: 访问localhost:8083
- **Then**: 页面正常加载，控制台无错误
- **Verification**: `programmatic`

### AC-7: 不自动部署
- **Given**: 本地验证通过
- **When**: 任务完成
- **Then**: 不执行wrangler deploy或git push，等待用户确认
- **Verification**: `programmatic`

## Open Questions
- 无
