# A股短线复盘看板 - 消息中心技术架构设计

**文档版本：** v1.0  
**创建日期：** 2026-07-01  
**技术负责人：** TRAE  
**状态：** 定稿  

---

## 1. 总体架构

消息中心是「A股短线复盘看板」的一个功能子模块，采用与主应用完全一致的纯前端单页架构。无后端服务、无框架依赖、无构建步骤，所有代码以内联方式写在单个 HTML 文件中，通过原生 JavaScript 与 DOM API 实现全部交互。

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              index.html (单页应用)                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   主应用    │  │  消息中心   │  │ Service    │  │   │
│  │  │   模块      │  │   模块      │  │  Worker    │  │   │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  │         ↑                 ↑                ↑        │   │
│  │    ┌─────────┐      ┌──────────┐     ┌─────────┐  │   │
│  │    │localStorage│   │ 静态JSON  │     │  Cache  │  │   │
│  │    │  (已读状态)│   │(portfolio)│     │ Storage │  │   │
│  │    └─────────┘      └──────────┘     └─────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

消息中心与主应用共享以下运行时环境：

- **宿主**：浏览器（Chrome/Edge/Safari/Firefox 现代版本）
- **渲染**：原生 DOM + CSS3
- **存储**：`localStorage`（已读状态持久化）
- **离线**：Service Worker（Cache Storage 离线兜底）
- **图表**：ECharts（趋势图）、原生 Canvas（热力图/树图）
- **数据源**：内联 JS 变量（`DAYS`、`FUND_PORTFOLIO`、`TRANSACTIONS`）+ `/api/portfolio.json`

---

## 2. 模块划分与职责

消息中心按关注点划分为 4 个内聚模块，全部以内联函数形式存在于 `a-share-review-dashboard.html` 的 `<script>` 标签中。

### 2.1 数据生成模块（Data Generator）

**职责**：将主应用已有的 `DAYS` 数组转换为消息中心可用的消息列表。

**核心逻辑**：遍历 `DAYS`，对每个交易日调用 `calcPnL(day)` 计算证券收益，再叠加 `FUND_PORTFOLIO` 的基金日收益，构造完整的消息对象。消息按日期倒序排列（最新在前）。

**关键特征**：
- 纯计算逻辑，无副作用
- 每次打开面板时实时生成，不缓存中间结果
- 消息 ID 采用前缀 `pnl_` + 日期，确保唯一性

### 2.2 已读状态模块（Read State Manager）

**职责**：管理用户对每条消息的已读/未读状态，提供读取、写入、批量标记能力。

**实现方式**：
- 以 `localStorage` 键 `a_share_msg_read` 存储已读消息 ID 数组
- 读取时做 `JSON.parse` 异常兜底，避免脏数据导致功能崩溃
- 写入时直接覆盖全量数组，不采用增量追加（简化一致性处理）

### 2.3 渲染引擎模块（Render Engine）

**职责**：负责消息列表、消息详情、空状态、头部统计栏的 DOM 渲染。

**实现方式**：
- 采用字符串模板拼接 + `innerHTML` 注入，不引入虚拟 DOM
- 列表与详情共用一个容器 `#msgPanelBody`，通过重新赋值 `innerHTML` 实现切换
- 未读消息通过 CSS 类名 `unread` 控制视觉样式

### 2.4 交互控制模块（Interaction Controller）

**职责**：控制面板的打开、关闭、点击事件委托、角标更新。

**实现方式**：
- 面板显隐通过 CSS 类名 `active` 切换（`display: flex/none`）
- 遮罩层点击关闭通过事件委托判断 `event.target === this`
- 角标为独立 DOM 节点 `#msgBadge`，通过 `textContent` 与 `style.display` 更新

---

## 3. 数据流设计

消息中心的数据流遵循「单向数据流 + 命令式更新」模式：

```
┌──────────────┐     读取      ┌──────────────┐
│   DAYS[]     │ ─────────────→│ generateMsgs │
│FUND_PORTFOLIO│               │   ()         │
└──────────────┘               └──────┬───────┘
                                      │ 生成 msgs[]
                                      ▼
                              ┌──────────────┐
                              │   msgs[]     │
                              │  (内存数组)   │
                              └──────┬───────┘
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
   ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
   │ updateBadge │           │ renderList  │            │ openDetail  │
   │    ()       │           │    ()       │            │    ()       │
   └──────┬──────┘           └──────┬──────┘            └──────┬──────┘
          │                         │                          │
          ▼                         ▼                          ▼
   ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
   │  比对 read  │           │ 拼接 HTML   │            │ markMsgRead │
   │  计算未读数  │           │ innerHTML   │            │   (id)      │
   └──────┬──────┘           └──────┬──────┘            └──────┬──────┘
          │                         │                          │
          ▼                         ▼                          ▼
   ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
   │ #msgBadge   │           │#msgPanelBody│            │localStorage │
   │ textContent │           │   innerHTML │            │   setItem   │
   └─────────────┘           └─────────────┘            └─────────────┘
```

### 3.1 数据流关键规则

1. **源数据只读**：`DAYS`、`FUND_PORTFOLIO` 等源数据由主应用初始化，消息中心仅读取不修改
2. **已读状态单向写入**：用户点击消息后，先写 `localStorage`，再触发角标重算与 UI 刷新
3. **无事件总线**：模块间通过直接函数调用通信，不引入发布/订阅机制
4. **无数据绑定**：DOM 更新由函数显式触发，不存在自动侦听/响应逻辑

---

## 4. 接口/函数定义清单

### 4.1 数据生成

```javascript
/**
 * 从 DAYS 数组生成每日收益消息列表
 * @returns {Array<Message>} 按日期倒序排列的消息数组
 */
function generateMessages()
```

**Message 对象结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一标识，格式 `pnl_YYYY-MM-DD` |
| `type` | `string` | 消息类型，当前固定为 `daily_pnl` |
| `date` | `string` | 交易日日期，`YYYY-MM-DD` |
| `title` | `string` | 消息标题，如 `2026-06-30 每日收益通知` |
| `preview` | `string` | 列表页预览文本，含总收益、证券收益、基金收益 |
| `detail` | `object` | 详情页数据，见下表 |

**Detail 对象结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `allPnl` | `number` | 当日总收益（证券 + 基金） |
| `allPct` | `number` | 当日总收益率 |
| `stockPnl` | `number` | 证券当日收益 |
| `stockPct` | `number` | 证券当日收益率 |
| `fundPnl` | `number` | 基金当日收益 |
| `fundPct` | `number` | 基金当日收益率 |
| `mv` | `number` | 当日总市值 |
| `theme` | `string` | 当日主题（可为空） |
| `sector` | `string` | 主线板块（可为空） |

### 4.2 已读状态管理

```javascript
/**
 * 从 localStorage 读取已读消息 ID 数组
 * @returns {Array<string>} 已读消息 ID 列表，异常时返回空数组
 */
function getReadMsgIds()

/**
 * 标记单条消息为已读
 * @param {string} id - 消息唯一标识
 * @sideEffect 更新 localStorage，触发角标刷新
 */
function markMsgRead(id)

/**
 * 标记所有消息为已读
 * @sideEffect 更新 localStorage，刷新角标与列表
 */
function markAllRead()
```

### 4.3 渲染函数

```javascript
/**
 * 渲染消息列表到 #msgPanelBody
 * 包含顶部统计栏（消息总数 + 全部已读按钮）与消息列表
 * @sideEffect 修改 #msgPanelBody.innerHTML
 */
function renderMsgList()

/**
 * 渲染单条消息详情到 #msgPanelBody
 * @param {string} id - 消息唯一标识
 * @sideEffect 修改 #msgPanelBody.innerHTML，自动标记已读
 */
function openMsgDetail(id)
```

### 4.4 交互控制

```javascript
/**
 * 打开消息中心面板
 * @sideEffect 为 #msgCenter 添加 active 类，触发列表渲染
 */
function openMsgCenter()

/**
 * 关闭消息中心面板
 * @sideEffect 移除 #msgCenter 的 active 类
 */
function closeMsgCenter()

/**
 * 计算并更新铃铛角标数字
 * @sideEffect 修改 #msgBadge 的 textContent 与 display 样式
 */
function updateMsgBadge()
```

---

## 5. 状态管理设计

消息中心仅维护一种客户端状态：**已读消息 ID 集合**。状态总量小（最多数百条字符串），结构简单，因此不引入 Redux/Vuex/Pinia 等状态管理库，直接以 `localStorage` 作为持久化存储介质。

### 5.1 状态结构

```javascript
// localStorage 键名
const MSG_READ_KEY = 'a_share_msg_read';

// 存储值示例（JSON 字符串）
'["pnl_2026-06-30", "pnl_2026-06-29", "pnl_2026-06-27"]';
```

### 5.2 状态转换表

| 当前状态 | 用户行为 | 下一个状态 | 副作用 |
|---------|---------|-----------|--------|
| 任意 | 打开消息中心 | 不变 | 渲染列表，角标保持 |
| 未读 | 点击单条消息 | 该消息变为已读 | 写 localStorage，角标减 1 |
| 任意 | 点击「全部已读」 | 全部变为已读 | 写 localStorage，角标清零，列表刷新 |
| 已读 | 新交易日数据发布 | 新消息为未读 | 下次打开页面时角标自动显示 |

### 5.3 状态一致性保障

- **写操作原子性**：`markAllRead()` 一次性写入全量 ID 数组，避免并发追加导致数据丢失
- **读操作防御性**：`getReadMsgIds()` 对 `JSON.parse` 做 `try/catch`，脏数据时降级为空数组
- **无并发冲突**：单页应用单线程执行，不存在多标签页同时写入的竞态条件（可接受最终一致性）

---

## 6. 存储方案

### 6.1 localStorage 持久化

| 项目 | 说明 |
|------|------|
| 键名 | `a_share_msg_read` |
| 值类型 | JSON 字符串化后的字符串数组 |
| 容量占用 | 按 1000 条消息估算约 20KB，远低于 5MB 上限 |
| 作用域 | 同源策略限制，仅当前域名可用 |
| 生命周期 | 长期保存，除非用户手动清除浏览器数据 |

### 6.2 Service Worker 缓存

消息中心作为应用内嵌模块，其离线能力由全局 Service Worker 统一提供：

```javascript
// sw.js 中缓存的静态资源
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg', '/api/portfolio.json'];
```

SW 采用「网络优先、缓存兜底」策略：
1. 优先发起网络请求获取最新 `index.html` 与 `portfolio.json`
2. 请求成功后将响应写入 Cache Storage
3. 网络失败时返回缓存副本，保证消息中心在弱网/离线环境下仍可打开并查看历史消息

### 6.3 无服务端状态

消息中心不依赖任何服务端会话、Cookie 或 Token。已读状态完全保存在客户端，换设备或清除浏览器数据后已读记录丢失，此行为符合产品预期（轻量级本地功能）。

---

## 7. 性能优化策略

### 7.1 计算优化

| 策略 | 实现方式 | 收益 |
|------|---------|------|
| 惰性生成 | `generateMessages()` 仅在打开面板时调用，非页面加载时 | 减少首屏不必要的 CPU 占用 |
| 避免重复遍历 | 列表渲染与角标更新共用同一 `msgs` 数组引用 | 单次面板打开只生成一次数据 |
| 简单数据类型 | 消息对象均为纯 JSON 可序列化结构，无循环引用 | 降低 GC 压力 |

### 7.2 渲染优化

| 策略 | 实现方式 | 收益 |
|------|---------|------|
| innerHTML 批量写入 | 列表通过字符串模板一次性拼接后注入 | 相比逐条 `createElement` 减少重排次数 |
| 无持久化监听器 | 关闭面板时不保留滚动位置或临时状态 | 释放内存，逻辑简单 |
| CSS 类切换 | 未读状态通过 `unread` / `read` 类名控制 | 避免运行时动态计算样式 |

### 7.3 存储优化

| 策略 | 实现方式 | 收益 |
|------|---------|------|
| 仅存 ID | localStorage 中只存字符串 ID，不存完整消息内容 | 体积最小化 |
| 批量写入 | `markAllRead()` 一次性覆盖，而非逐条 `push` | 减少写入次数 |

### 7.4 待优化项（未来迭代）

1. **消息数据缓存**：当 `DAYS` 数组较大（>365 天）时，每次打开面板重新生成消息对象存在优化空间，可考虑在页面加载时预生成并缓存于内存变量中
2. **虚拟滚动**：若消息数量突破 200 条，列表渲染可能出现卡顿，届时可引入简易虚拟滚动（仅渲染视口内 + 上下缓冲区的节点）
3. **增量更新**：当前 `generateMessages()` 遍历全量 `DAYS`，可优化为只生成新增日期的消息

---

## 8. 部署与兼容性

### 8.1 部署方式

消息中心随主应用一起打包为单文件 `index.html`，通过以下任一方式部署至 Cloudflare Pages：

- **手动上传**：将 `index.html`、`sw.js`、`manifest.json`、`icon.svg`、`api/portfolio.json` 上传至 Pages 托管目录
- **Wrangler CLI**：`wrangler pages deploy site`

更新流程：修改源码 → 本地验证 → 重新部署 → 客户端刷新后自动获取最新版本（Service Worker 会在下次激活时清理旧缓存）。

### 8.2 浏览器兼容性

| 特性 | 最低支持版本 | 降级方案 |
|------|-------------|---------|
| `localStorage` | IE 8+ / 全部现代浏览器 | 无已读状态功能，消息中心仍可浏览 |
| `classList` | IE 10+ / 全部现代浏览器 | 使用 `element.className` 字符串操作 |
| `flexbox` | IE 10+ / 全部现代浏览器 | 面板布局退化为 `block` 流式布局 |
| `position: fixed` | IE 7+ / 全部现代浏览器 | 无降级，核心功能不受影响 |
| Service Worker | Chrome 45+, Safari 11.1+, Firefox 44+ | 弱网无缓存兜底，不影响在线使用 |

### 8.3 移动端适配

消息中心面板采用固定定位 + 最大宽度限制，在移动端表现如下：

- 面板宽度 `max-width: 480px`，小屏下自动撑满视口宽度
- 遮罩层 `padding: 16px`（移动端）/ `padding: 20px`（桌面端）
- 列表项点击区域最小高度 `56px`，符合移动端无障碍触控规范
- 字体使用 `rem` 单位，随根字号缩放自然适配

### 8.4 无障碍（a11y）

- 铃铛按钮已添加 `aria-label="消息中心"`
- 关闭按钮使用语义化 `<button>` 标签
- 面板打开后焦点管理可由后续迭代补充（当前未做焦点锁定）

---

## 附录：文件位置与关键代码索引

| 文件 | 路径 | 说明 |
|------|------|------|
| 主应用入口 | `/workspace/trae-handoff/site/index.html` | 生产环境部署文件 |
| 源码文件 | `/workspace/trae-handoff/a-share-review-dashboard.html` | 开发主文件，含完整消息中心代码 |
| Service Worker | `/workspace/trae-handoff/sw.js` | 离线缓存逻辑 |
| 数据文件 | `/workspace/trae-handoff/api/portfolio.json` | 可选动态数据源 |
| 清单文件 | `/workspace/trae-handoff/manifest.json` | PWA 配置 |

---

*本文档由 TRAE 生成，作为消息中心功能开发、维护与交接的技术依据。*
