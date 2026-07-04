# P0-P3数据自动更新功能恢复 - Product Requirement Document

## Overview
- **Summary**: 恢复v1.33.0中引入但在后续版本中意外丢失的P0-P3数据自动更新功能，确保交易日数据自动归档、基金净值自动拉取、多数据源校验正常工作。
- **Purpose**: 解决周五数据未自动归档的问题，确保每个交易日15:05后自动凝固收盘数据，22:00自动拉取基金确认净值，无需手动补数据。
- **Target Users**: 个人投资者（看板使用者）

## Goals
- P0: 交易日15:05后自动从东财+新浪双数据源拉取收盘数据并凝固到DAYS数组，保存到localStorage
- P1: 基金净值三态管理（盘中估值/上一日净值/当日确认净值），22:00自动拉取正式净值
- P3: 股票/指数价格多数据源交叉校验，差异>0.5%时控制台警告
- 确保周五(2026-07-03)数据正确（已手动修复）
- SW缓存名随版本更新，确保用户拿到新版本

## Non-Goals (Out of Scope)
- P2 Python/GitHub Actions独立脚本验证（文件已存在，作为离线备份机制）
- UI/UX重大改动
- 新增板块热度自动抓取（现有refreshMarketData已处理）

## Background & Context
- v1.33.0版本实现了P0-P3功能，但在v1.34.x的多次bug修复中，核心函数（snapshotClose、CN_HOLIDAYS、isTradingDay、多数据源校验）被意外删除
- 当前代码仅保留：实时行情每10秒刷新、基金净值定时拉取（但时间错误为22:30）、15:30指数快照保存（不完整）
- 周五(7/3)数据缺失的根本原因就是snapshotClose函数不存在

## Functional Requirements
- **FR-1**: 2026年全年A股交易日历（法定节假日+调休工作日），isTradingDay()正确判断交易日
- **FR-2**: 交易日15:05后自动执行snapshotClose()，拉取指数+股票收盘价，凝固到DAYS数组
- **FR-3**: 收盘归档数据保存到localStorage，页面刷新不丢失
- **FR-4**: 基金净值三态：交易时段显示估值(gsz)，盘后(22:00后)显示当日确认净值(dwjz)
- **FR-5**: 基金确认净值22:00自动拉取（修正当前22:30的错误）
- **FR-6**: 指数/股票价格同时从东财和新浪获取，双源差异>0.5%时console.warn警告，优先东财数据
- **FR-7**: SW CACHE_NAME随版本号更新，触发自动更新

## Non-Functional Requirements
- **NFR-1**: 所有API请求必须带超时(10s)，避免挂起
- **NFR-2**: 自动归档失败时静默处理，不影响页面正常使用
- **NFR-3**: 不重复归档（当日已归档标记）

## Constraints
- **Technical**: 单文件HTML，所有逻辑内联；使用东财+新浪公开API（无CORS问题）
- **Dependencies**: 东方财富push2 API、新浪财经hq.sinajs.cn API、天天基金fund.eastmoney.com API

## Acceptance Criteria

### AC-1: 交易日历正确判断
- **Given**: 当前日期为2026年任意一天
- **When**: 调用isTradingDay(dateStr)
- **Then**: 正确返回是否为交易日（排除法定节假日，包含调休周末上班日）
- **Verification**: `programmatic`

### AC-2: 15:05自动归档收盘数据
- **Given**: 交易日15:05后打开页面，且当日未归档
- **When**: 自动归档定时器触发
- **Then**: 从东财+新浪拉取三大指数和持仓股票收盘价，写入DAYS数组末尾，保存到localStorage，标记closed=true
- **Verification**: `programmatic`

### AC-3: 基金22:00自动拉取确认净值
- **Given**: 交易日22:00后打开页面
- **When**: 基金净值定时器触发
- **Then**: 拉取两基金当日确认净值，更新FUND_PORTFOLIO和FUND_NAV_HISTORY
- **Verification**: `programmatic`

### AC-4: 多数据源交叉校验
- **Given**: 拉取指数/股票价格
- **When**: 东财和新浪两个数据源返回数据
- **Then**: 差异>0.5%时输出console.warn，最终使用东财数据
- **Verification**: `programmatic`

### AC-5: SW版本更新触发刷新
- **Given**: 部署新版本
- **When**: 用户打开旧版本页面
- **Then**: 检测到SW更新后提示用户或自动刷新加载新版本
- **Verification**: `human-judgment`

## Open Questions
- 无
