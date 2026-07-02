# A股短线复盘看板

单文件 HTML 投资复盘工具，集成持仓管理、大盘情绪、待办清单、纪念日等功能。

## 在线地址

https://a-share-review-dashboard.pages.dev

## 技术栈

- **前端**: 单文件 HTML（内联 CSS + JS，无构建工具）
- **数据源**: 东方财富 API（实时行情/板块排行）
- **持久化**: localStorage（认证状态/待办/纪念日/盘中盈亏）
- **部署**: Cloudflare Pages（wrangler CLI）
- **版本管理**: Git + GitHub

## 项目结构

```
a-share-review-dashboard/
├── a-share-review-dashboard.html  # 主开发文件（所有代码都在这里）
├── index.html                      # 根目录副本（= 主文件，用于 GitHub 预览）
├── site/                           # Cloudflare Pages 部署目录
│   ├── index.html                  # 部署副本（= 主文件）
│   ├── preview.html                # 预览副本（= 主文件）
│   ├── api/portfolio.json          # 持仓数据 API
│   ├── _headers                    # Cloudflare 安全头
│   ├── sw.js                       # PWA Service Worker
│   ├── manifest.json               # PWA 配置
│   ├── icon.svg                    # 应用图标
│   └── versions.json               # 版本历史 JSON
├── versions.json                   # 版本历史（根目录副本）
├── .env                            # Cloudflare 配置（gitignored）
├── .env.example                    # 配置模板
├── .gitignore
└── README.md
```

## 核心架构

### 单文件结构（a-share-review-dashboard.html）

文件内部分为以下区域（按顺序）：

| 区域 | 行范围 | 说明 |
|------|--------|------|
| CSS 样式 | 1-500 | 全部样式内联在 `<style>` 标签内 |
| HTML 骨架 | 500-700 | 页面容器、弹窗、版本弹窗 |
| 常量配置 | 690-870 | `APP_VERSION`、`AUTH_ACCOUNTS`、`VERSION_HISTORY`、`CLASSIC_POEMS` |
| 数据层 | 870-1770 | `DAYS` 数组、`DATA_API`、localStorage 读写 |
| 路由函数 | 1774-1796 | `goHome/goHoldings/goMarket/goTodoDetail/goAnniDetail` |
| 面包屑 | 1780-1796 | `BREADCRUMB_SECTIONS` + `buildBreadcrumbs()` |
| 认证系统 | 1880-2130 | 登录/登出/数据遮罩联动 |
| 待办清单 | 1950-2050 | CRUD + localStorage（key: `todos_${user}`） |
| 纪念日 | 2060-2200 | CRUD + 描述编辑 + localStorage（key: `anni_${user}`） |
| 实时行情 | 2340-2600 | 东方财富 API 调用 + secid 格式 |
| 页面渲染 | 2940-3500 | `render()` 分发 + 5 个 render 函数 |

### 页面路由

```javascript
// currentPage 变量控制页面切换
let currentPage = 'home'; // home | holdings | market | todoDetail | anniDetail

function render() {
  if (currentPage === 'home') renderHome();
  else if (currentPage === 'holdings') renderHoldings();
  else if (currentPage === 'market') renderMarket();
  else if (currentPage === 'todoDetail') renderTodoDetail();
  else if (currentPage === 'anniDetail') renderAnniDetail();
}
```

### 认证系统

- 账号配置: `AUTH_ACCOUNTS` 对象（admin/admin123）
- 登录后 `dataRevealed = true`，自动解密所有遮罩数据
- 未登录时收益/资产显示 `****`
- 5 次点击标题打开登录弹窗

### 面包屑导航

```javascript
const BREADCRUMB_SECTIONS = [
  { key: 'home', label: '首页', action: 'goHome()' },
  { key: 'holdings', label: '持仓总览', action: 'goHoldings()' },
  { key: 'market', label: '大盘情绪', action: 'goMarket()' },
  { key: 'todoDetail', label: '待办清单', action: 'goTodoDetail()' },
  { key: 'anniDetail', label: '纪念日', action: 'goAnniDetail()' },
];
// 新增卡片时，只需在数组中添加一条配置
```

## 开发流程

### 本地预览

```bash
cd site
python3 -m http.server 8080
# 访问 http://localhost:8080/preview.html
```

### 部署到 Cloudflare Pages

```bash
# 1. 同步主文件到部署目录
cp a-share-review-dashboard.html site/index.html

# 2. 部署
npx wrangler pages deploy site --project-name=a-share-review-dashboard --commit-dirty=true
```

### 推送到 GitHub

```bash
git add -A
git commit -m "release vX.X.X: 更新说明"
git push origin main
```

### 完整发布流程（修改后一键执行）

```bash
cp a-share-review-dashboard.html site/index.html && \
cp a-share-review-dashboard.html site/preview.html && \
cp a-share-review-dashboard.html index.html && \
npx wrangler pages deploy site --project-name=a-share-review-dashboard --commit-dirty=true && \
git add -A && \
git commit -m "release vX.X.X: 更新说明" && \
git push origin main
```

## 配置

### Cloudflare（.env）

```
CLOUDFLARE_ACCOUNT_ID=你的账号ID
CLOUDFLARE_API_TOKEN=你的API Token
```

### 认证账号（代码内）

```javascript
const AUTH_ACCOUNTS = {
  'admin': { password: 'admin123', name: '管理员' }
};
```

## 版本历史

当前版本: **v1.16.0**

详见 `versions.json` 或页面内 `VERSION_HISTORY` 数组。
