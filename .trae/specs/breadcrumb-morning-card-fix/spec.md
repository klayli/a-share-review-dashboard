# 面包屑导航修复 · 7月7日早报 · 持仓卡片点击移除 Spec

## Why

1. **面包屑导航 bug 未修复**：之前的版本声称修复了面包屑点击无响应问题，但实际上 `buildBreadcrumbs()` 生成的 `<a>` 标签仍然缺少 `href` 属性，导致某些浏览器点击无法触发 onclick 事件，点击"返回首页"后面包屑失效。
2. **今日早报未更新**：7月7日的早报数据缺失，需要添加。
3. **持仓卡片点击体验优化**：持仓卡片点击会弹窗股票明细，但实际上用户可以通过右侧链接点击，卡片点击弹窗是多余的，移除后体验更干净。

## What Changes

- **修复**：`buildBreadcrumbs()` 函数中给 `<a>` 标签添加 `href="javascript:void(0)"` 属性
- **修复**：所有其他 `<a>` 标签使用 `onclick` 的地方（如早报日期锚点）也添加 `href` 属性
- **新增**：`MORNING_REPORTS['2026-07-07']` 添加今日早报数据（市场概况、热门股票、今日预测、新闻来源）
- **移除**：持仓明细中证券/基金卡片的 `onclick` 点击弹窗，保留右侧链接点击

## Impact

- Affected code:
  - `a-share-review-dashboard.html` - `buildBreadcrumbs()` 函数、`MORNING_REPORTS` 对象、`renderHoldings()` 函数
  - 需要同步更新 `site/index.html`、`site/preview.html`、`index.html`
- Version bump: v1.39.0 → v1.39.1

## ADDED Requirements

### Requirement: Breadcrumb Navigation Reliability

The system **SHALL** ensure all `<a>` tags that use `onclick` for navigation include `href="javascript:void(0)"` to guarantee click event delivery across all browsers.

#### Scenario: After navigation click
- **WHEN** user clicks any breadcrumb link
- **THEN** the onclick handler is always triggered and navigation works correctly

## MODIFIED Requirements

### Requirement: Holding Card Interaction

The system **SHALL NOT** open a stock/fund detail popup when clicking the holding card body. Only the dedicated link on the right side should trigger the popup.

#### Scenario: User clicks holding card
- **WHEN** user clicks anywhere on the holding card (except the right-side link)
- **THEN** no popup is opened

#### Scenario: User clicks stock/fund link
- **WHEN** user clicks the stock/fund link on the right side
- **THEN** the detail popup opens as expected

## REMOVED Requirements

### Requirement: Holding Card Click Popup
**Reason**: Redundant interaction, the link on the right is sufficient. Clicking anywhere on the card accidentally triggers popup which is annoying.
**Migration**: Keep the link on the right, remove the onclick from the card itself.
