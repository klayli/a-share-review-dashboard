# A股短线复盘看板 - 多任务修复与增强 PRD

## Overview
- **Summary**: 修复早报数据更新问题、headerCustom云端存储、日期选择器排序、浏览器密码提示问题、完善云端数据同步机制，并将股票弹窗K线图替换为ECharts交互式图表。
- **Purpose**: 解决用户反馈的6个问题，提升产品稳定性和用户体验。
- **Target Users**: 看板的所有用户

## Goals
1. 修复早报数据无法自动更新的问题，确保每日早报数据及时刷新
2. 确保headerCustomInput数据保存后正确同步到云端存储
3. 确保顶部日期选择器最新日期在最前（倒序排列）
4. 修复待办清单输入时浏览器提示保存密码的问题
5. 确保待办清单、纪念日、三省等所有用户数据正确实现云端存储
6. 将股票弹窗中的K线图从静态GIF替换为ECharts交互式图表（支持均线、5日线、10日线、30日线）

## Non-Goals (Out of Scope)
- 不修改现有数据结构和API接口
- 不增加新的页面或功能模块
- 不修改现有认证机制

## Background & Context
- 项目是单文件HTML投资复盘看板，部署在Cloudflare Pages
- 早报数据目前硬编码在`MORNING_REPORTS`对象中，没有自动更新机制
- 已有Cloudflare KV存储和`/api/user/data`接口用于云端数据同步
- 股票K线图目前使用新浪财经的GIF图片

## Functional Requirements
- **FR-1**: 早报数据更新机制修复
  - 检查GitHub Actions自动更新脚本是否正常工作
  - 确保早报数据能够从外部API获取或自动生成
- **FR-2**: headerCustom云端存储
  - 确保`saveHeaderCustom`函数正确触发`scheduleCloudSync`
  - 确保`loadFromCloud`正确加载headerCustom数据
- **FR-3**: 日期选择器倒序排列
  - 确保`renderDateButtons`中日期按倒序排列
- **FR-4**: 浏览器密码提示修复
  - 移除待办输入框的密码提示触发条件
  - 添加`autocomplete="off"`和`autocapitalize="off"`属性
- **FR-5**: 全数据云端存储
  - 确保所有用户数据（待办、纪念日、三省日记、AI配置、headerCustom）都正确同步到云端
  - 确保登录时从云端加载最新数据
- **FR-6**: ECharts K线图
  - 使用东方财富API获取K线数据
  - 使用ECharts渲染交互式K线图
  - 支持5日、10日、30日均线
  - 支持时间范围切换（5日、30日、年线）

## Non-Functional Requirements
- **NFR-1**: 数据同步可靠性 - 确保云端同步失败时有本地缓存兜底
- **NFR-2**: 图表性能 - K线图加载时间不超过2秒
- **NFR-3**: 兼容性 - ECharts图表在主流浏览器中正常显示

## Constraints
- **Technical**: 单文件HTML结构，所有代码在`a-share-review-dashboard.html`中
- **Dependencies**: Cloudflare Pages Functions, Cloudflare KV, 东方财富API, ECharts CDN

## Assumptions
- Cloudflare KV存储已正确配置
- 东方财富API可用且返回预期格式
- 用户网络连接正常时云端同步可正常工作

## Acceptance Criteria

### AC-1: 早报数据更新修复
- **Given**: 当前日期为2026-07-06
- **When**: 查看早报页面
- **Then**: 能够显示2026-07-06的早报数据
- **Verification**: `human-judgment`

### AC-2: headerCustom云端存储
- **Given**: 用户已登录
- **When**: 在headerCustomInput中输入内容并失焦
- **Then**: 数据同步到云端，刷新页面后数据仍然存在
- **Verification**: `programmatic`

### AC-3: 日期选择器倒序排列
- **Given**: 页面加载完成
- **When**: 打开日期选择下拉框
- **Then**: 最新日期显示在最上方
- **Verification**: `human-judgment`

### AC-4: 浏览器密码提示修复
- **Given**: 用户在待办清单输入框中输入内容
- **When**: 输入过程中或失焦时
- **Then**: 浏览器不会弹出保存密码提示
- **Verification**: `human-judgment`

### AC-5: 全数据云端存储
- **Given**: 用户在多台设备上使用看板
- **When**: 在A设备添加待办/纪念日/日记，然后在B设备登录
- **Then**: B设备能够看到A设备添加的数据
- **Verification**: `programmatic`

### AC-6: ECharts K线图
- **Given**: 用户点击股票卡片查看趋势
- **When**: 打开股票弹窗
- **Then**: 显示交互式K线图，包含5日、10日、30日均线，支持时间范围切换
- **Verification**: `human-judgment`

## Open Questions
- [ ] 早报数据更新脚本是否需要修改？
- [ ] ECharts CDN地址是否需要配置？
- [ ] 东方财富K线API的具体参数格式是什么？