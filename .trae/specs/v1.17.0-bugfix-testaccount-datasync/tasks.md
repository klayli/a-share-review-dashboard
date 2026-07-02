# A股短线复盘看板 v1.17.0 - Implementation Plan

## [ ] Task 1: 修复小问题（双分号+project.md同步步骤）
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修复[a-share-review-dashboard.html:699](file:///workspace/a-share-review-dashboard.html#L699)行末双分号`;;`为单分号`;`
  - 更新[.trae/rules/project.md:19](file:///workspace/.trae/rules/project.md#L19)的同步命令，增加`cp a-share-review-dashboard.html index.html`步骤
  - 更新[README.md](file:///workspace/README.md)中的完整发布流程命令（已包含但需确认一致）
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: 第699行代码末尾只有一个分号（grep验证）
  - `programmatic` TR-1.2: project.md中的同步命令包含index.html的cp命令
- **Notes**: 纯文本修改，无逻辑变更

## [ ] Task 2: 修复板块热力图API数据解析bug
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修复[refreshMarketData()](file:///workspace/a-share-review-dashboard.html#L2590)中`pct: s.f3 / 100`的除法错误——东方财富`qt/clist/get`API的f3字段已返回百分比值（如2.35表示+2.35%），不应除以100，改为`pct: s.f3`
  - 同步修复第2599行`topSectors`的pct值（当前通过sectors数组引用，会自动修复，但需验证）
  - 修复第2602-2606行`sectorHeat`的`desc`和`leaders`字段——不应为空字符串，需要根据涨停池数据推导：对每个板块，查找涨停池中hy字段匹配的股票作为龙头
  - 同步修复`heatMap`（第2600行）的pct值
  - 注意：需将板块龙头股推导逻辑放在涨停池数据获取之后（当前代码顺序是先获取板块再获取涨停池，需要调整顺序或在涨停池获取后回填）
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: 刷新后sectorHeat中pct值大于0.5（正常交易日板块涨幅应>0.5%而非0.02%）
  - `human-judgement` TR-2.2: 板块热力图颜色深浅与涨跌幅匹配（大涨的板块深色+大尺寸，小涨浅色+小尺寸），红绿颜色正确
  - `programmatic` TR-2.3: 领涨板块(top3Heat)显示的百分比与热力图一致
  - `human-judgement` TR-2.4: 板块卡片"龙头："后显示具体股票名称而非"龙头：—"（有涨停股时）
- **Notes**: 核心bug修复。API字段单位确认：clist/get的f3与stock/get的f170单位不同——f3已直接是百分比，f170是基点（需/100）

## [ ] Task 3: 版本说明去掉明文密码
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 修改[VERSION_HISTORY:831](file:///workspace/a-share-review-dashboard.html#L831)中v1.15.0的notes：将"登录系统（admin/admin123）"改为"登录系统"
  - 同步修改根目录[versions.json](file:///workspace/versions.json)中v1.15.0的summary
  - 同步修改[site/versions.json](file:///workspace/site/versions.json)中v1.15.0的summary
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-3.1: 代码和两个versions.json中搜索"admin123"无结果（除AUTH_ACCOUNTS配置外）

## [ ] Task 4: 新增test测试账号+模拟数据
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在[AUTH_ACCOUNTS](file:///workspace/a-share-review-dashboard.html#L1926)中添加test账号：`'test': { password: 'test', name: '测试用户', isTest: true }`
  - 创建模拟数据集`TEST_DATA`对象，包含：模拟持仓（如成本10000元，持有3只模拟股票，市值约10500元）、模拟价格、模拟交易记录、模拟基金持仓、模拟DAYS数据（3-5天）、模拟备选标的
  - 新增函数`isTestUser()`判断当前登录用户是否为test账号
  - 数据加载逻辑：当isTestUser()为true时，使用TEST_DATA替代真实HOLDINGS/STOCK_INFO/FUND_PORTFOLIO/TRANSACTIONS/DAYS
  - 待办清单和纪念日localStorage key按用户隔离：`todos_${user}`和`anni_${user}`——当前代码已用此格式（line ~2028/getTodos中），需确认
  - 在页面顶部或版本区域显示"🧪 测试模式"标识，当isTestUser()为true时可见
  - 实时行情刷新：test账号下也刷新三大指数，但持仓价格使用模拟数据（不刷新），板块/涨停等市场数据正常刷新
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - `programmatic` TR-4.1: 使用test/test可成功登录
  - `human-judgement` TR-4.2: test账号登录后持仓数据与admin不同，显示"测试模式"标识
  - `programmatic` TR-4.3: test账号添加的待办admin看不到（localStorage key不同）
  - `human-judgement` TR-4.4: test账号所有页面（首页/持仓/大盘/待办/纪念日）均可正常访问
  - `programmatic` TR-4.5: 退出test登录admin后，admin数据正常不受影响
- **Notes**: 模拟数据要合理逼真（有涨有跌，金额为正常投资量级）

## [ ] Task 5: 创建Cloudflare Worker后端定时采集服务
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 创建`worker/`目录结构：`worker/src/index.js`、`worker/wrangler.toml`、`worker/package.json`
  - Worker功能：
    1. 采集三大指数实时数据（上证/深证/创业板，从东方财富API）
    2. 采集板块涨跌幅排行（行业板块+概念板块，从clist API，f3不除以100）
    3. 采集涨停池/跌停池数据
    4. 采集两市成交额
    5. 从涨停池数据推导板块龙头股
    6. 自动生成策略推演、隔夜计划、热点汇总（基于采集数据的规则推算）
    7. 将组装好的当日复盘JSON存入Cloudflare KV（key: `daily:{date}`）
    8. 提供HTTP API：`GET /api/daily/{date}`返回JSON数据
  - Cron Trigger配置：北京时间10:00/14:00/15:05对应UTC 2:00/6:00/7:05，cron表达式：`0 2,6 * * 1-5`（10:00/14:00）和`5 7 * * 1-5`（15:05）
  - KV namespace绑定：`DAILY_DATA`
  - 配置wrangler.toml：name、main、compatibility_date、kv_namespaces、triggers.crons
  - CORS头设置，允许Pages域名访问
  - User-Agent和Referer头设置以访问东方财富API
- **Acceptance Criteria Addressed**: AC-10, AC-12
- **Test Requirements**:
  - `programmatic` TR-5.1: Worker本地可启动（`wrangler dev`），访问`/api/daily/2026-07-02`返回合法JSON
  - `programmatic` TR-5.2: 返回的JSON包含idx/sectorHeat/limitUp/limitDown/volume等必要字段
  - `programmatic` TR-5.3: sectorHeat中pct值为正确百分比（如2.35而非0.0235）
  - `human-judgement` TR-5.4: wrangler.toml配置正确，cron表达式为工作日UTC 2:00/6:00/7:05
- **Notes**: Worker需要设置正确的请求头访问东方财富API（Referer: https://quote.eastmoney.com/）

## [ ] Task 6: 前端适配Worker API + 数据合并逻辑
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - 扩展[loadPortfolioApi()](file:///workspace/a-share-review-dashboard.html#L1795)函数，增加从Worker API获取当日复盘数据的逻辑
  - 新增函数`fetchDailyFromWorker(date)`：请求`/api/daily/${date}`，失败时静默降级
  - 页面初始化流程：先加载portfolio.json（持仓/交易数据），再尝试从Worker获取当日复盘数据
  - Worker数据合并策略：
    - 三大指数：实时刷新优先（从前端直接调东方财富API），Worker数据作为初始值
    - 板块/涨停/成交额/情绪：使用Worker数据，前端手动刷新时覆盖
    - 策略/热点/隔夜计划：使用Worker数据
  - 三大指数保持实时刷新机制不变（每10秒在交易时段刷新）
  - 前端定时自动刷新Worker数据：在10:00/14:00/15:05后自动检查并拉取最新数据（页面打开状态下）
  - 降级处理：Worker API返回404或错误时，使用内置DAYS数据+前端refreshMarketData逻辑
  - 更新数据更新时间显示，区分"实时数据"和"API快照"
- **Acceptance Criteria Addressed**: AC-11, AC-12
- **Test Requirements**:
  - `programmatic` TR-6.1: 当Worker API正常时，当日DAYS数据被Worker返回的数据填充
  - `programmatic` TR-6.2: 当Worker API返回404/错误时，页面正常使用内置数据不报错
  - `human-judgement` TR-6.3: 数据更新时间正确显示数据来源
  - `programmatic` TR-6.4: 三大指数在交易时段继续实时更新（不被Worker缓存数据覆盖）
- **Notes**: 保持现有refreshMarketData()的前端刷新能力作为手动触发方式

## [ ] Task 7: 版本号更新 + 同步副本 + 部署
- **Priority**: medium
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 6
- **Description**:
  - 更新APP_VERSION为v1.17.0，APP_VERSION_DATE为当前日期
  - 更新APP_RELEASE_NOTES为本次更新内容
  - 在VERSION_HISTORY头部添加v1.17.0记录
  - 更新versions.json（根目录和site/）添加v1.17.0条目
  - 同步文件：`cp a-share-review-dashboard.html site/index.html && cp a-share-review-dashboard.html site/preview.html && cp a-share-review-dashboard.html index.html`
  - 部署前端到Cloudflare Pages：`npx wrangler pages deploy site --project-name=a-share-review-dashboard --commit-dirty=true`
  - 部署Worker：`cd worker && npx wrangler deploy`
  - Git提交并推送
- **Acceptance Criteria Addressed**: AC-1 through AC-12
- **Test Requirements**:
  - `programmatic` TR-7.1: 所有文件（主文件、index.html、site/index.html、site/preview.html）内容一致
  - `programmatic` TR-7.2: versions.json current字段为v1.17.0
  - `human-judgement` TR-7.3: 线上页面可访问且功能正常
  - `programmatic` TR-7.4: Worker已部署且API可访问
- **Notes**: Task 5(Worker)和Task 6(前端适配)完成后才能部署
