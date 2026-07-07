# 热点题材个股 STOCK_INFO 注册 Spec

## Why

v1.39.6 将 hotThemes.stocks 切换为 API 查询的真实板块成分股（如中芯国际 688981、海光信息 688041 等），但这些新股票代码未注册到 `STOCK_INFO` 查找表。`linkStocks()` 函数依赖 `STOCK_INFO` 将股票名称转换为可点击链接，缺失注册导致个股显示为纯文本（无样式、不可点击），用户感知为"股票没有显示"。

## What Changes

- **修改**：`STOCK_INFO` 常量，新增 ~25 个缺失的股票代码条目

## Impact

- Affected code: `a-share-review-dashboard.html` - `STOCK_INFO` 对象（约 line 3365-3416）
- 无需修改渲染逻辑，仅补全数据

## MODIFIED Requirements

### Requirement: STOCK_INFO 查找表完整性

The system SHALL maintain complete `STOCK_INFO` entries for all stock codes referenced in hotThemes.stocks fields.

#### Scenario: 中芯国际在 hotThemes 中显示
- **WHEN** renderMarket 渲染 7/2 热点题材"黄金/有色"
- **THEN** stocks 字段 "山东黄金(600547) · 中金黄金(600489) · 兴业银锡(000426)" 中的个股名称显示为可点击链接

## 缺失的股票代码清单

以下是从 v1.39.6 hotThemes.stocks 中提取但未在 STOCK_INFO 中注册的代码：

| 代码 | 名称 | 前缀 |
|------|------|------|
| 688981 | 中芯国际 | sh |
| 688041 | 海光信息 | sh |
| 688802 | 沐曦股份-U | sh |
| 601138 | 工业富联 | sh |
| 002594 | 比亚迪 | sz |
| 002475 | 立讯精密 | sz |
| 300433 | 蓝思科技 | sz |
| 002600 | 领益智造 | sz |
| 688017 | 绿的谐波 | sh |
| 600547 | 山东黄金 | sh |
| 600489 | 中金黄金 | sh |
| 000426 | 兴业银锡 | sz |
| 601899 | 紫金矿业 | sh |
| 603993 | 洛阳钼业 | sh |
| 002379 | 宏桥控股 | sz |
| 300979 | 华利集团 | sz |
| 600177 | 雅戈尔 | sh |
| 600398 | 海澜之家 | sh |
| 002714 | 牧原股份 | sz |
| 300999 | 金龙鱼 | sz |
| 300498 | 温氏股份 | sz |
| 000858 | 五粮液 | sz |
| 603288 | 海天味业 | sh |
| 000895 | 双汇发展 | sz |
| 000568 | 泸州老窖 | sz |
| 300972 | 万辰集团 | sz |
| 600704 | 物产中大 | sh |