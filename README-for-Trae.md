# Trae 接力说明：A股短线复盘看板

## 项目目标
做一个** publicly accessible（公开可访问）、移动端 + PC 端自适应** 的 A 股每日复盘看板，托管在 Netlify。核心是一页纯静态 HTML，内嵌全部数据、样式和交互，方便直接在浏览器打开或一键部署。

## 文件清单

| 文件 | 说明 |
|------|------|
| `a-share-review-dashboard.html` | 主文件，看板本体（原 `A股复盘看板.html`，单文件，无需后端） |
| `2026-06-29-review-report.md` | 对应日期的文字版复盘报告（原 `2026-06-29_A股复盘报告.md`） |
| `_headers` | Netlify 部署用，强制 `.html` 返回 `text/html; charset=UTF-8` |
| `.env.example` | 部署凭据模板（需自行填入 Netlify Token 和 Site ID） |
| `README-for-Trae.md` | 本说明 |

> 注：为避免跨平台解压时中文文件名乱码，handoff 包内使用英文文件名。原始中文文件仍保留在 `outputs/` 目录。

## 当前已实现功能

1. **日期切换**：顶部下拉框 + 前一天/后一天按钮，可切换 2026-06-23 至 2026-06-29 的复盘数据。
2. **当日数据快照**：页面最顶部展示当天三大指数、总市值、当日盈亏、当日主题、主线板块，并标注日期。
3. **趋势图表**：持仓总市值走势、每日盈亏柱状图、个股价格趋势（相对涨跌幅）、三大指数走势，全部用原生 SVG 绘制。
4. **持仓盈亏播报**：个股卡片展示最新价、成本价、持仓市值、持仓盈亏、距回本幅度、MA5/MA20 距离、加仓建议等。
5. **大盘 & 情绪**：涨停数、封板率、市场情绪、涨跌家数、量能、方向判断。
6. **主线板块 & 热点题材**：展示当日最强板块、驱动因素、龙头股、涨停梯队。
7. **股票可点击弹窗**：所有股票名称带 📈 蓝色标签，点击弹出近 30 日 K 线图（新浪日线 GIF），并提供东方财富详情链接。
8. **最新价标签**：所有提到的股票均显示最新价。
9. **响应式布局**：PC 端图表双列，手机端自动一图一行。
10. **A 股红涨绿跌配色**：红色表示上涨/盈利，绿色表示下跌/亏损。

## 代码结构说明

- **单文件 HTML**：全部 CSS 在 `<style>`，全部 JS 在 `<script>`，无外部依赖（除新浪 K 线图和东方财富跳转）。
- **数据层**：
  - `HOLDINGS`：持仓成本、股数、名称。
  - `STOCK_INFO`：股票代码 → 名称、最新价、交易所前缀（`sh`/`sz`）。
  - `DAYS`：每一天的复盘数据，包括指数、主题、策略、热点题材、观察池等。
- **工具函数**：
  - `stockTag(code)`：生成带最新价的可点击蓝色股票标签。
  - `linkStocks(text)`：把文本中的 `代码(名称)` 自动替换成可点击标签。
  - `showTrend(code)` / `closeTrend()`：弹窗控制。
  - `calcPnL(d)`：根据当日价格计算持仓盈亏。
  - `renderCharts()`：用原生 SVG 绘制 4 个图表。
- **样式变量**：`:root` 中定义了背景、卡片、红/绿/黄/蓝主题色，统一修改即可换肤。

## 数据更新方式

当前为**静态手写数据**。后续如需自动化，可：
- 用 East Money / 腾讯财经 / Sina 等 API 定时抓取最新价、指数、涨停数据；
- 将 `STOCK_INFO` 和 `DAYS` 抽成 JSON，构建时写入 HTML；
- 或用 Node/Python 脚本生成最终 HTML。

## 部署方式

### 1. 手动拖拽（最简单）
将 `a-share-review-dashboard.html` 重命名为 `index.html`，和 `_headers` 一起拖到 [Netlify Drop](https://app.netlify.com/drop)。

### 2. 用 Netlify REST API 自动部署（推荐）

1. 复制 `.env.example` 为 `.env`，填入：
   - `NETLIFY_TOKEN`：在 [Netlify User Settings → Applications → Personal Access Tokens](https://app.netlify.com/user/applications/personal) 生成。
   - `SITE_ID`：站点设置中的 Site ID。
2. 将 `a-share-review-dashboard.html` 重命名为 `index.html`，和 `_headers` 一起放入一个文件夹（比如 `site/`）。
3. 打包成 zip（**不要直接 zip 单个文件**，要 zip 一个包含 `index.html` 的文件夹，否则 Netlify 会识别为 `/` 并返回 `text/plain`）。
4. POST 到 Netlify API：

```bash
curl -H "Authorization: Bearer $NETLIFY_TOKEN" \
     -H "Content-Type: application/zip" \
     --data-binary "@site.zip" \
     "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys"
```

### 3. Netlify CLI（如果本机有 Node）

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=site
```

## 部署踩坑记录

- **坑 1：页面显示源码**
  - 原因：用 API 直接上传单个 `index.html` 的 zip 时，Netlify 把它识别为根路径 `/`，没有扩展名，默认 `Content-Type: text/plain`。
  - 解决：zip 包里放入 `_headers` 强制 `text/html; charset=UTF-8`，或改 zip 结构为一个文件夹。
- **坑 2：部署后缓存旧版本**
  - 解决：访问时加 `?nocache=随机数` 刷新；确认 `Content-Length` 和 ETag 已变化。
- **坑 3：新浪 K 线图不显示**
  - 新浪图片接口对 Referer 敏感，弹窗中的 `<img>` 直接加载可能偶发 403。若遇到，可在图片 URL 后加 `?t=时间戳`，或换用东方财富/同花顺 K 线 API。

## 下一步可优化方向（供参考）

1. **数据自动化**：接入腾讯财经 `http://qt.gtimg.cn/q=sh601288,sz159941` 获取实时价格，自动生成最新一天数据。
2. **历史 K 线弹窗增强**：当前弹窗只显示静态图片，可加上 5 日/30 日/年线切换按钮。
3. **盈亏归因图表**：增加个股对总盈亏的贡献度饼图/堆叠柱状图。
4. **板块热力图**：用颜色深浅展示当日各行业涨跌幅。
5. **Obsidian/Notion 联动**：把 Markdown 报告自动同步到知识库。
6. **暗黑/亮色主题切换**：目前只有暗黑主题，可增加开关。
7. **PWA**：加 `manifest.json` 和 Service Worker，手机可添加到桌面。

## 当前线上地址

- 生产地址：`https://a-share-review.netlify.app/`
- 最新部署 ID：`6a425a6d21903b346e63471c`

## 交接人

前序工作在 QoderWork 完成，后续优化将在 Trae 继续。
