# 大盘情绪导航修复 + 真实API数据校正 Spec

## Why

1. 大盘情绪详情页无法跳转：`renderThemeCard()` 函数在 `t.pct` 为 undefined 时调用 `t.pct.toFixed(2)` 抛出 TypeError，导致 `renderMarket()` 崩溃，页面 innerHTML 未更新。
2. DAYS 数组中 7/6 和 7/7 被错误标记为"非交易日"且指数数据为 0% 变化，实际从新浪财经 API 获取的真实数据显示这两天均为正常交易日。

## What Changes

- **修复**：`renderThemeCard()` 添加 `t.pct` 空值安全检查，pct 为 undefined 时显示"—"或不显示百分比
- **修复**：DAYS 数组 7/6 数据修正为真实行情（上证 4041.24/-0.06%、深证 15416.80/-1.16%、创业板 3948.86/-1.77%）
- **修复**：DAYS 数组 7/7 数据修正为真实行情（上证 3990.24/-1.26%、深证 15225.11/-1.24%、创业板 3911.91/-0.94%）
- **修复**：DAYS 数组 7/3 数据精度微调（从 API 数据四舍五入）

## Impact

- Affected code: `a-share-review-dashboard.html` - `renderThemeCard()`（line 8978-8988）、`DAYS` 数组 7/6 和 7/7 条目
- 需要同步更新 `site/index.html`、`site/preview.html`、`index.html`
- Version bump: v1.39.3 → v1.39.4

## 真实 API 数据来源

通过新浪财经 K 线 API 获取（`money.finance.sina.com.cn`）：

| 日期 | 上证指数 | 深证成指 | 创业板指 |
|------|---------|---------|---------|
| 7/3 (周五) | 4043.64 (+0.37%) | 15597.51 (+0.64%) | 4019.93 (+0.07%) |
| 7/6 (周一) | 4041.24 (-0.06%) | 15416.80 (-1.16%) | 3948.86 (-1.77%) |
| 7/7 (周二) | 3990.24 (-1.26%) | 15225.11 (-1.24%) | 3911.91 (-0.94%) |

## MODIFIED Requirements

### Requirement: Market Page Navigation

The system **SHALL** navigate to the market detail page when user clicks:
1. Home page market card's "查看详情" link
2. Breadcrumb "大盘情绪" link

#### Scenario: Click card "查看详情"
- **WHEN** user clicks the market card on home page
- **THEN** the page navigates to market detail view with all sections rendered

#### Scenario: Click breadcrumb "大盘情绪"
- **WHEN** user clicks "大盘情绪" in the breadcrumb navigation
- **THEN** the page navigates to market detail view

### Requirement: renderThemeCard pct Safety

The system **SHALL** handle `t.pct` being undefined in `renderThemeCard()` gracefully without throwing TypeError.

#### Scenario: hotThemes entry has no pct field
- **WHEN** `renderThemeCard()` is called with a theme object that has no `pct` property
- **THEN** the function renders the theme card without percentage display (or shows "—")

### Requirement: DAYS Data Accuracy

The system **SHALL** use real market data from Sina Finance API for all DAYS entries.

#### Scenario: 7/6 and 7/7 are trading days
- **WHEN** the system renders data for 2026-07-06 or 2026-07-07
- **THEN** the index data reflects actual market closing prices from the API