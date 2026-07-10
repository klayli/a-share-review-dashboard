# A股短线复盘看板 - TRAE Code 项目规则

## 项目概述

单文件 HTML 投资复盘看板，部署在 Cloudflare Pages。

## 关键文件

- **主开发文件**: `a-share-review-dashboard.html`（所有 CSS/JS/HTML 都在此文件内）
- **部署目录**: `site/`（部署前需将主文件复制为 `site/index.html`）
- **数据 API**: `site/api/portfolio.json`（持仓数据）
- **版本历史**: `versions.json`

## 开发约定

### 修改代码

1. **只修改** `a-share-review-dashboard.html`
2. 修改后同步副本: `cp a-share-review-dashboard.html site/index.html && cp a-share-review-dashboard.html site/preview.html && cp a-share-review-dashboard.html index.html`

### 版本号

- 修改 `APP_VERSION` 和 `APP_VERSION_DATE`（约 line 697-698）
- 更新 `APP_RELEASE_NOTES`（约 line 699）
- 在 `VERSION_HISTORY` 数组头部添加新版本记录（约 line 829）
- 更新 `site/versions.json` 和根目录 `versions.json`

### 部署流程

```bash
# 预览（不部署）
cd site && python3 -m http.server 8080

# 部署
npx wrangler pages deploy site --project-name=a-share-review-dashboard --commit-dirty=true

# 推送 Git
git add -A && git commit -m "release vX.X.X: 说明" && git push origin main
```

### 代码结构（行号参考）

| 区域 | 行范围 | 关键变量/函数 |
|------|--------|--------------|
| CSS | 1-500 | CSS 变量: `--bg`, `--card`, `--blue`, `--yellow` 等 |
| 常量 | 690-870 | `APP_VERSION`, `AUTH_ACCOUNTS`, `VERSION_HISTORY` |
| 路由 | 1774-1796 | `goHome()`, `goHoldings()`, `goMarket()`, `goTodoDetail()`, `goAnniDetail()` |
| 面包屑 | 1780-1796 | `BREADCRUMB_SECTIONS`, `buildBreadcrumbs()` |
| 认证 | 1880-2130 | `getAuthUser()`, `doLogin()`, `doLogout()`, `dataRevealed` |
| 待办 | 1950-2050 | `getTodos()`, `addTodo()`, `renderTodoList()` |
| 纪念日 | 2060-2200 | `getAnniversaries()`, `addAnniversary()`, `renderAnniversary()` |
| 实时行情 | 2340-2600 | `refreshLivePnL()`, `refreshMarketData()`, secid 格式: `1.000001` |
| 页面渲染 | 2940-3500 | `render()`, `renderHome()`, `renderHoldings()`, `renderMarket()` |

### API 说明

- 东方财富实时行情: `https://push2.eastmoney.com/api/qt/stock/get?secid={secid}&fields={fields}`
- secid 格式: 上证 `1.000001`，深证 `0.399001`，创业板 `0.399006`
- 板块排行: `https://push2ex.eastmoney.com/api/qt/clist/get`

### 认证

- 默认账号: `admin` / `admin123`
- 配置在 `AUTH_ACCOUNTS` 对象中
- 登录后 `dataRevealed = true`，数据自动解密

### 注意事项

- 不要在代码中硬编码 Cloudflare API Token
- `.env` 文件已被 gitignore，不会提交到 GitHub
- 部署前务必同步 `a-share-review-dashboard.html` 到 `site/index.html`
- 新增页面时，在 `BREADCRUMB_SECTIONS` 数组中添加面包屑配置

### Cloudflare KV

- 项目名称: `a-share-review-dashboard`
- 账户 ID: `b0286f9e4a2bd889c47a7644d565c9d4`
- KV 命名空间 `USER_DATA`: `ea06b101b8114c60bcb0461672fb3125`

## 数据完整性规则（永久生效）

### 核心原则

所有显示数据必须基于真实市场数据，严禁编造。

### 具体规则

1. **基金和股票数据**
   - FUND_NAV_HISTORY、FUND_PORTFOLIO、STOCK_INFO 等所有基金和股票相关数据必须从真实 API 获取
   - 禁止手动编造基金净值、股票价格、收益率等数据
   - 更新数据时必须使用东方财富、天天基金等可信数据源

2. **金融市场早报**
   - MORNING_REPORTS 中的所有早报数据（全球指数、A股、港股、美股、外汇、商品、加密货币等）必须基于真实市场情况
   - 早报内容（核心焦点、市场回顾、宏观数据、新闻等）必须符合当日真实市场情况
   - 禁止编造虚假的市场数据和新闻

3. **持仓数据**
   - 持仓盈亏、持有收益、持有收益率等必须基于真实价格和净值计算
   - DAYS 数组中的每日数据（price、idx、funds 等）必须与真实市场一致
   - 禁止编造持仓收益数据

4. **大盘情绪**
   - 备选标的（watchlist）必须基于真实涨停或强势个股
   - 涨停家数、跌停家数、涨跌家数等必须基于真实数据
   - 板块热点（hotThemes）和板块热力图（sectorHeat）必须基于真实板块表现

5. **明日一句话策略**
   - 策略建议必须结合当日真实市场情绪和板块轮动
   - 策略内容必须具体、有针对性，符合当日市场情况
   - 禁止生成泛泛而谈或与市场情况不符的策略建议

### 验证要求

每次更新数据后，必须通过以下方式验证数据真实性：
- 通过东方财富 API 核对股票和指数价格
- 通过天天基金 API 核对基金净值
- 参考财联社、东方财富网等权威财经媒体确认市场情况
- 在部署前进行人工审核，确保数据真实可靠
