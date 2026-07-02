# A股短线复盘看板 v1.17.0 - Product Requirement Document

## Overview
- **Summary**: 本次迭代包含6项改动：(1)修复代码小问题（双分号、project.md同步步骤缺失）；(2)修复刷新数据后板块热力图百分比显示错误（所有板块显示+0.02%~+0.06%且龙头为空）；(3)版本说明中v1.15.0描述去掉明文密码；(4)新增test测试账号，登录后展示预置模拟数据；(5)复盘数据根据每日复盘报告格式自动生成框架（三大指数实时更新）；(6)交易日10:00/14:00/15:05定时自动同步数据到页面（Cloudflare Worker + KV + Cron Trigger）。
- **Purpose**: 修复数据刷新bug，增加测试账号功能，实现数据自动化采集和定时同步，减少手动维护成本。
- **Target Users**: 个人投资者（admin账号），测试/演示用户（test账号）。

## Goals
- 修复板块热力图API数据解析bug，确保刷新后涨跌幅显示正确
- 修复代码小问题（双分号、文档同步步骤）
- 版本说明去掉明文密码暴露
- 新增test账号，展示独立的模拟数据，与admin真实数据隔离
- 搭建后端自动采集服务（Cloudflare Worker + KV + Cron），交易日10:00/14:00/15:05自动同步市场数据
- 前端从后端API获取当日数据，三大指数保持实时刷新

## Non-Goals (Out of Scope)
- 不做用户注册系统（仅admin和test两个固定账号）
- 不做历史回测或量化交易功能
- 不改变现有UI设计风格
- 不做多用户数据隔离的复杂权限系统（test账号仅展示固定模拟数据）
- 不做短信/邮件通知
- 参考复盘报告的完整格式解析（用户尚未提供参考文件，按现有DAYS数据结构实现框架，后续可扩展）

## Background & Context
- 项目是单文件HTML应用（`a-share-review-dashboard.html`，3837行），部署在Cloudflare Pages
- 当前版本v1.16.0，已有5个页面路由（home/holdings/market/todoDetail/anniDetail）
- 板块热力图bug根因：`refreshMarketData()`函数中，东方财富`qt/clist/get`API的`f3`字段返回的是百分比值（如2.35表示+2.35%），但代码错误地除以100（`s.f3 / 100`），导致6%的板块涨幅显示为0.06%。同时`desc`和`leaders`字段被设为空字符串，导致"龙头: —"。
- 当前数据完全内联在JS的DAYS数组中，刷新时从东方财富API获取部分实时数据（指数、板块排行、涨停池），但策略/热点/板块描述等仍依赖手动维护
- 项目已使用wrangler CLI部署到Cloudflare Pages，可自然扩展Cloudflare Worker

## Functional Requirements

- **FR-1**: 修复APP_RELEASE_NOTES行末双分号`;;`为单分号`;`
- **FR-2**: 更新`.trae/rules/project.md`中的同步命令，增加`cp a-share-review-dashboard.html index.html`步骤
- **FR-3**: 修复板块热力图API数据解析bug——将`pct: s.f3 / 100`改为`pct: s.f3`，同时为板块数据补充`desc`和`leaders`字段（从涨停池数据推导龙头股）
- **FR-4**: 修复`topSectors`同样的pct除法bug
- **FR-5**: 修改VERSION_HISTORY中v1.15.0的notes，将"登录系统（admin/admin123）"改为"登录系统"
- **FR-6**: 修改versions.json（根目录和site/）中v1.15.0的summary，同样去掉密码
- **FR-7**: 在AUTH_ACCOUNTS中新增test账号（用户名: test，密码: test，显示名: 测试用户）
- **FR-8**: test账号登录后，所有持仓数据（HOLDINGS成本/份额、STOCK_INFO价格、FUND_PORTFOLIO、TRANSACTIONS）使用预置模拟数据，与admin真实数据完全隔离
- **FR-9**: test账号的待办清单和纪念日数据使用独立的localStorage key（如`todos_test`/`anni_test`），不与admin数据混淆
- **FR-10**: test账号登录后，页面上显示"测试模式"标识，明确区分
- **FR-11**: 创建Cloudflare Worker后端服务，负责定时采集东方财富API数据（三大指数、板块排行、涨停池、成交额、领涨股等）
- **FR-12**: Worker使用Cron Trigger，在交易日10:00、14:00、15:05（北京时间）自动执行数据采集
- **FR-13**: Worker将采集到的数据存入Cloudflare KV，前端通过API路径`/api/daily/{date}.json`获取
- **FR-14**: 前端`loadPortfolioApi()`扩展为同时加载当日复盘数据（如果Worker API可用），合并到DAYS数组中
- **FR-15**: 三大指数保持实时刷新（不经过KV缓存，直接从东方财富API获取），其余复盘数据从Worker API获取
- **FR-16**: Worker部署配置和前端API适配保持兼容，当Worker不可用时降级为现有内置数据+前端API刷新逻辑

## Non-Functional Requirements
- **NFR-1**: 所有修改必须保持单文件HTML架构，不引入构建工具
- **NFR-2**: Worker代码放在`worker/`目录下，独立于前端代码
- **NFR-3**: 前端降级策略：Worker API不可用时，回退到现有内置数据+前端刷新逻辑
- **NFR-4**: test账号数据完全隔离，不影响admin账号的任何数据
- **NFR-5**: Cron Trigger只在交易日（周一至周五，排除中国法定节假日简化处理为仅周末排除）执行
- **NFR-6**: API请求需要有超时和错误处理，单次采集不超过15秒
- **NFR-7**: 保持移动端响应式布局不变

## Constraints
- **Technical**: 单文件HTML（无框架无构建）、Cloudflare Pages部署、Cloudflare Workers + KV用于后端、东方财富免费API作为数据源
- **Business**: 免费方案（Cloudflare免费额度内运行）、无付费API依赖
- **Dependencies**: 东方财富公开API（push2.eastmoney.com / push2ex.eastmoney.com）、wrangler CLI、Cloudflare账号

## Assumptions
- 东方财富API在Cloudflare Worker环境中可正常访问（需设置正确的User-Agent和Referer）
- Cloudflare KV免费额度足够存储每日复盘数据（每天约5KB，一年约1.2MB）
- Cron Trigger的cron表达式使用UTC时间，北京时间10:00/14:00/15:05对应UTC 2:00/6:00/7:05
- 中国法定节假日暂不做特殊处理（仅排除周末），后续可通过API或配置补充
- 板块龙头股推导逻辑：从涨停池数据中找到属于领涨板块的涨停股作为龙头
- 参考复盘报告文件暂不可用，数据结构按现有DAYS数组字段实现，后续用户提供文件后可调整字段映射

## Acceptance Criteria

### AC-1: 修复小问题
- **Given**: 主文件a-share-review-dashboard.html第699行
- **When**: 代码被检查
- **Then**: APP_RELEASE_NOTES行末只有一个分号，无`;;`
- **Verification**: `programmatic`

### AC-2: project.md同步步骤更新
- **Given**: .trae/rules/project.md中的开发约定
- **When**: 用户查看同步命令
- **Then**: 包含`cp a-share-review-dashboard.html index.html`步骤
- **Verification**: `programmatic`

### AC-3: 板块热力图pct修复
- **Given**: 用户点击"刷新数据"按钮（或页面自动刷新）
- **When**: 板块数据从东方财富API获取后渲染热力图
- **Then**: 板块涨跌幅显示正确的百分比（如+2.35%而非+0.02%），红绿颜色和深浅根据涨跌幅正确反映
- **Verification**: `programmatic` + `human-judgment`

### AC-4: 板块龙头股显示
- **Given**: 板块热力图数据刷新成功且有涨停股数据
- **When**: 渲染热力图板块卡片
- **Then**: 龙头股字段显示该板块下涨停的股票名称（格式如"寒武纪(688256) · 晶方科技(603005)"），而非"龙头: —"
- **Verification**: `programmatic` + `human-judgment`

### AC-5: topSectors修复
- **Given**: 大盘情绪页面的领涨板块展示
- **When**: 数据刷新后
- **Then**: 领涨板块的涨跌幅百分比正确（同样不受/100 bug影响）
- **Verification**: `programmatic`

### AC-6: 版本说明去掉密码
- **Given**: VERSION_HISTORY数组和versions.json
- **When**: 用户查看v1.15.0版本说明
- **Then**: 不包含"admin/admin123"明文密码，改为"登录系统"
- **Verification**: `programmatic`

### AC-7: test账号登录
- **Given**: 登录弹窗
- **When**: 用户输入test/test并点击登录
- **Then**: 成功登录，显示"测试用户"名称，所有页面可访问
- **Verification**: `programmatic`

### AC-8: test账号显示模拟数据
- **Given**: test账号已登录
- **When**: 查看持仓总览、盈亏、交易记录等
- **Then**: 所有持仓金额、盈亏数字、交易记录均为预置模拟数据，与admin数据不同；页面有"测试模式"标识
- **Verification**: `human-judgment`

### AC-9: test账号数据隔离
- **Given**: test账号添加待办/纪念日
- **When**: 退出并切换到admin账号
- **Then**: admin账号看不到test账号的待办/纪念日，反之亦然
- **Verification**: `programmatic`

### AC-10: Worker定时采集
- **Given**: Cloudflare Worker已部署且Cron Trigger已配置
- **When**: 交易日10:00/14:00/15:05到达
- **Then**: Worker自动采集东方财富数据并存入KV，生成当日复盘JSON
- **Verification**: `programmatic`

### AC-11: 前端获取Worker数据
- **Given**: Worker API可用
- **When**: 前端页面加载或刷新
- **Then**: 从`/api/daily/{date}.json`获取当日复盘数据并展示，三大指数继续实时更新
- **Verification**: `programmatic` + `human-judgment`

### AC-12: 降级策略
- **Given**: Worker API不可用（如本地预览、网络错误）
- **When**: 页面加载
- **Then**: 降级为现有内置数据+前端API刷新逻辑，页面正常显示不报错
- **Verification**: `programmatic`

## Open Questions
- [ ] 参考复盘报告文件尚未提供（用户表示会放到workspace），数据字段映射可能需要后续调整
- [ ] Cloudflare账号KV namespace需要用户在Cloudflare控制台创建或通过wrangler创建
- [ ] 中国法定节假日是否需要排除？当前仅排除周末，节假日可能导致非交易日也执行采集
- [ ] Worker采集的复盘数据是否需要包含策略推演/热点汇总等AI生成内容，还是仅采集客观数据（指数/板块/涨停/成交额）？
