# 热点题材动态去重 + 版本通知修复 Spec

## Why

1. **热点题材重复**：v1.39.6 将 hotThemes.stocks 切换为 API 板块成分股 Top 3，但某些成分股与 sectorHeat.leaders 重叠（如寒武纪 688256 同时出现在半导体 sectorHeat.leaders 和半导体 hotThemes.stocks 中）。需要改为运行时动态获取 + 去重。

2. **版本通知按钮点击崩溃**：`VERSION_HISTORY` 中 v1.39.6 条目误用 `desc` 字段名而非 `notes`，导致 `openVersionLog()` 中 `notes.split('；')` 抛出 `TypeError`。

## What Changes

- **修复**：`VERSION_HISTORY` v1.39.6 条目 `desc` → `notes`
- **修改**：`renderMarket()` 改为异步函数，对带 `bkCode` 的 hotTheme 动态调用 `fetchSectorStocks()` 获取板块成分股，过滤掉与 sectorHeat.leaders 重叠的个股，取 Top 3
- **修改**：`renderThemeCard()` 支持异步渲染（`stocks` 可为 Promise 或占位符）
- **新增**：`dedupStocks()` 函数，从 API 返回的股票列表中排除 sectorHeat.leaders 中出现的股票

## Impact

- Affected code: `a-share-review-dashboard.html`
  - `VERSION_HISTORY`（line 1539）：`desc` → `notes`
  - `renderMarket()`（line 9104）：改为 async，添加动态去重逻辑
  - `renderThemeCard()`（line 9027）：支持异步 stocks 更新
  - 新增 `dedupStocks()` 辅助函数

## 去重逻辑

```
renderMarket() 渲染流程：
  for each hotTheme t with bkCode:
    1. fetchSectorStocks(t.bkCode) → API 返回 Top 10 成分股
    2. 筛选 sectorHeat.leaders 中与本题材相关的条目
    3. 从 API 结果中排除与 sectorHeat.leaders 重叠的股票
    4. 取前 3 个作为代表个股
    5. 渲染到页面
```

## MODIFIED Requirements

### Requirement: VERSION_HISTORY 字段一致性

The system SHALL use `notes` field consistently across all VERSION_HISTORY entries.

#### Scenario: 版本通知按钮正常打开
- **WHEN** 用户点击版本通知按钮 `!`
- **THEN** `openVersionLog()` 不崩溃，正常显示所有版本记录

### Requirement: 热点题材个股动态去重

The system SHALL dynamically fetch sector stocks and exclude stocks that overlap with sectorHeat.leaders.

#### Scenario: 半导体题材个股不重复
- **WHEN** 渲染 2026-06-30 大盘情绪页面
- **THEN** 半导体 hotThemes.stocks 不包含 sectorHeat.leaders 中已出现的寒武纪(688256)
- **AND** 显示中芯国际(688981) · 海光信息(688041) · 北方华创(002371)（从 API Top 10 中排除重叠后取前 3）