# 热点题材代表个股去重 Spec

## Why

大盘情绪页"附录 · 当日热点题材汇总"中的"代表个股"（`hotThemes[].stocks`）与板块热力图中"龙头"（`sectorHeat[].leaders`）显示完全相同的股票列表（如纺织服装都显示"欣龙控股(000955) · 迎丰股份(605055) · 华升股份(600156)"），两个板块内容重复，用户无法区分热点题材的代表个股和板块领涨龙头。

## What Changes

- **修改**：DAYS 数组中所有 `hotThemes[].stocks` 字段，使其显示每个热点题材关联的前 3 只代表个股，与 `sectorHeat[].leaders` 区分开
- 每个热点题材的 `stocks` 应展示该题材最具代表性的个股（含代码），优先选择与板块龙头不同的代表性标的
- 涉及日期：6/26、6/27、6/28、6/29、6/30、7/1、7/2、7/3 等所有有 `hotThemes` 数据的日期

## Impact

- Affected code: `a-share-review-dashboard.html` - `DAYS` 数组中所有 `hotThemes[].stocks` 字段
- 需要同步更新 `site/index.html`、`site/preview.html`、`index.html`
- Version bump: v1.39.4 → v1.39.5

## MODIFIED Requirements

### Requirement: Hot Themes Representative Stocks

The system **SHALL** display unique representative stocks for each hot theme in the appendix, distinct from sector heat map leaders.

#### Scenario: 7/3 纺织服装热点题材
- **WHEN** user views the hot themes appendix for 2026-07-03
- **THEN** "纺织服装" shows representative stocks different from the "板块热力图" section's "纺织服装" leaders