# 热点题材代表个股 API 动态获取 Spec

## Why

"附录 · 当日热点题材汇总"的代表个股（`hotThemes[].stocks`）仍与板块热力图龙头（`sectorHeat[].leaders`）重复。用户要求通过 API 查询热点题材关联的真实股票，自动配置逻辑，禁止手动编造数据。

## What Changes

- **新增**：`BK_CODE_MAP` 常量，映射热点题材名称到东方财富 BK 板块代码
- **新增**：`fetchSectorStocks(bkCode)` 函数，调用 `push2delay.eastmoney.com` API 获取板块成分股 Top 3（按市值排序）
- **修改**：DAYS 数组中所有 `hotThemes[].stocks` 字段，替换为从 API 查询的真实代表个股数据
- **新增**：`hotThemes[].bkCode` 字段，存储板块代码便于后续动态更新

## API 说明

已通过 `push2delay.eastmoney.com` API 验证可用：

- 板块查询: `https://push2delay.eastmoney.com/api/qt/stock/get?secid=90.{BK_CODE}&fields=f58`
- 成分股查询: `https://push2delay.eastmoney.com/api/qt/clist/get?fid=f20&po=1&pz=3&pn=1&np=1&fltt=2&invt=2&fs=b:{BK_CODE}&fields=f12,f14`

## BK 板块代码映射

| 热点题材 | BK 代码 | 板块名称 |
|---------|---------|---------|
| 半导体/芯片 | BK1036 | 半导体 |
| 半导体概念 | BK0917 | 半导体概念 |
| 国产芯片 | BK0891 | 国产芯片 |
| AI/算力 | BK1127 | AI芯片 |
| CPO/算力硬件 | BK1128 | CPO概念 |
| 机器人/人形机器人 | BK1090 | 机器人概念 |
| 减速器 | BK1100 | 减速器 |
| 黄金/有色 | BK0732 | 贵金属 |
| 有色金属 | BK0478 | 有色金属 |
| 纺织服装 | BK0436 | 纺织服饰 |
| 农林牧渔 | BK0433 | 农林牧渔 |
| 食品饮料 | BK0438 | 食品饮料 |
| 养殖/猪肉 | BK0882 | 猪肉概念 |
| 农业种植 | BK0888 | 农业种植 |

## Impact

- Affected code: `a-share-review-dashboard.html` - 新增 `BK_CODE_MAP`、`fetchSectorStocks()`；DAYS 数组所有 `hotThemes[].stocks` 字段
- 需要同步更新 `site/index.html`、`site/preview.html`、`index.html`
- Version bump: v1.39.5 → v1.39.6

## ADDED Requirements

### Requirement: BK Code Mapping

The system **SHALL** maintain a `BK_CODE_MAP` constant mapping hot theme names to Eastmoney BK sector codes for API queries.

### Requirement: fetchSectorStocks API Function

The system **SHALL** provide `fetchSectorStocks(bkCode)` function that queries `push2delay.eastmoney.com` for the top 3 constituent stocks by market cap.

#### Scenario: Query semiconductor sector stocks
- **WHEN** `fetchSectorStocks('BK1036')` is called
- **THEN** returns array of top 3 stocks by market cap with format `{code, name}`

## MODIFIED Requirements

### Requirement: Hot Themes Representative Stocks

The system **SHALL** display API-queried representative stocks for each hot theme, distinct from sector heat map leaders.

#### Scenario: 7/3 纺织服装 hot theme
- **WHEN** user views the hot themes appendix for 2026-07-03
- **THEN** "纺织服装" shows top 3 BK0436 sector stocks by market cap from API