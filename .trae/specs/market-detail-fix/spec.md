# 大盘情绪详情页无法打开Bug修复 - Product Requirement Document

## Overview
- **Summary**: 修复两个问题：(1) 大盘情绪详情页无法进入的致命bug（renderThemeCard函数访问undefined的pct字段导致JavaScript崩溃）；(2) 补充2026年7月3日（周五）的持仓总览和大盘情绪数据，当前DAYS数组最新只到7月2日周四。
- **Purpose**: 用户无法通过首页大盘情绪卡片或面包屑导航进入大盘情绪详情页；周五数据缺失导致持仓和大盘情绪卡片无法显示最新交易日数据，严重影响核心功能使用。
- **Target Users**: 所有使用A股短线复盘看板的用户。

## Goals
- 修复renderThemeCard函数中pct字段为undefined时的崩溃问题
- 确保大盘情绪卡片点击可正常进入详情页
- 确保面包屑"大盘情绪"链接可正常跳转
- hotThemes数据无pct字段时优雅降级，不显示百分比或显示"—"
- 补充2026-07-03（周五）的完整大盘情绪数据（指数、涨跌家数、热点题材、板块热力图等）

## Non-Goals (Out of Scope)
- 不重构热点题材模块的数据结构
- 不新增热点题材涨跌幅的API实时获取功能
- 不修改其他页面的功能

## Background & Context
- 问题发现时间：2026-07-04
- Bug #1（详情页无法打开）：
  - 错误堆栈：`TypeError: Cannot read properties of undefined (reading 'toFixed') at renderThemeCard (line 8053)`
  - 根本原因：v1.20.0版本新增热点题材驱动因素自动生成功能时，renderThemeCard函数期望hotThemes条目包含pct（涨跌幅百分比）字段，但DAYS数组中所有历史静态数据的hotThemes都只有rank/name/badge/desc/stocks/dim字段，没有pct字段。当遍历渲染hotThemes时，t.pct为undefined，调用toFixed(2)直接抛出异常，导致renderMarket函数中断，页面白屏/无响应。
  - 影响范围：所有日期的大盘情绪详情页都无法打开
- Bug #2（周五数据缺失）：
  - DAYS数组最新数据只到2026-07-02（周四），缺少2026-07-03（周五）的交易日数据
  - 早报（MORNING_REPORTS）已有7月3日数据，显示周五A股行情：沪指跌2.03%失守4030点，深成指跌3.85%，创业板指暴跌5.71%，科创50跌7.70%；黄金/有色、纺织服装、农林牧渔等防御板块逆势上涨；科技股遭遇"黑色星期四"（实际是周四晚间到周五的行情，需要确认是7月2日还是7月3日数据）
  - 根据早报数据，7月3日凌晨美股因独立日休市，A股7月3日是周五交易日，需要补充对应数据

## Functional Requirements
- **FR-1**: renderThemeCard函数必须对pct字段做null/undefined安全检查，pct不存在时不崩溃
- **FR-2**: pct字段不存在时，不显示涨跌幅百分比，或显示"—"占位符
- **FR-3**: 点击首页大盘情绪卡片可正常进入详情页
- **FR-4**: 点击面包屑"大盘情绪"链接可正常进入详情页
- **FR-5**: 详情页所有板块（当日快照、大盘情绪、主线板块、热力图、备选标的、热点题材、隔夜单等）正常渲染无报错
- **FR-6**: 补充2026-07-03（周五）完整的DAYS数组数据，包含：指数点位/涨跌幅、主题/摘要、涨跌停家数、封板率、情绪、赚钱效应、成交额、涨跌比、操作方向、主线板块信息、驱动因素、龙头、板块强度、备选标的、隔夜单、策略、热点题材、板块热力图等所有字段
- **FR-7**: 7月3日数据需与早报（MORNING_REPORTS）中7月3日周五数据一致：沪强深弱，上证站上4100点，创业板跌近2%；港股大幅反弹恒生科技涨3.23%

## Non-Functional Requirements
- **NFR-1**: 修复后页面加载和渲染性能不下降
- **NFR-2**: 保持现有UI样式不变，pct有值时显示样式与原来一致
- **NFR-3**: 兼容所有历史日期数据，不需要修改DAYS数组中的静态数据

## Constraints
- **Technical**: 单文件HTML（a-share-review-dashboard.html），所有CSS/JS/HTML内联，不引入新依赖
- **Business**: 修复后需同步更新版本号，部署到GitHub和Cloudflare Pages
- **Dependencies**: 东方财富API（不变），localStorage存储（不变）

## Assumptions
- hotThemes的pct字段是可选字段，历史静态数据不包含该字段，未来API实时数据可能包含
- 修复方案只需在renderThemeCard函数中添加防御性判断即可解决，不需要修改数据层

## Acceptance Criteria

### AC-1: renderThemeCard空安全
- **Given**: hotThemes条目没有pct字段（值为undefined）
- **When**: renderMarket函数遍历调用renderThemeCard渲染热点题材
- **Then**: 不抛出JavaScript异常，页面正常渲染
- **Verification**: `programmatic`
- **Notes**: 控制台无TypeError错误

### AC-2: pct缺失时优雅显示
- **Given**: hotThemes条目的pct为undefined
- **When**: 渲染热点题材卡片
- **Then**: 不显示涨跌幅百分比数字，或显示"—"占位，不破坏布局
- **Verification**: `human-judgment`

### AC-3: 卡片点击进入详情
- **Given**: 用户在首页已登录状态
- **When**: 点击"大盘情绪"卡片任意位置
- **Then**: 正常跳转到大盘情绪详情页，所有内容正常显示
- **Verification**: `programmatic` + `human-judgment`

### AC-4: 面包屑导航跳转
- **Given**: 用户在任意页面
- **When**: 点击面包屑中的"大盘情绪"链接
- **Then**: 正常跳转到大盘情绪详情页
- **Verification**: `programmatic`

### AC-5: 所有历史日期正常
- **Given**: 用户通过日期选择器切换到任意历史日期（6/23-7/2）
- **When**: 进入该日期的大盘情绪详情页
- **Then**: 页面正常渲染，无JavaScript错误
- **Verification**: `programmatic`

### AC-6: 7月3日周五数据补充
- **Given**: DAYS数组
- **When**: 查看日期选择器
- **Then**: 包含2026-07-03（周五）的完整交易日数据
- **Verification**: `programmatic` + `human-judgment`
- **Notes**: 数据需与早报信息一致：港股反弹恒生科技涨3.23%、黄金V型反转、隔夜美股道指涨1.14%创历史新高纳指跌0.80%；A股7月2日暴跌后周五行情合理构建（超跌反弹或延续分化）

### AC-7: 首页日期选择器包含周五
- **Given**: 用户在首页
- **When**: 查看日期选择下拉框
- **Then**: 可以选择2026-07-03周五，并正确显示当天的持仓和大盘情绪数据
- **Verification**: `programmatic`

## Open Questions
- 无
