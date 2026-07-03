# 更新7月3日早报数据 - The Implementation Plan

## [ ] Task 1: 更新MORNING_REPORTS['2026-07-03']全部板块数据
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将'2026-07-03'早报从盘前版（周四暴跌回顾）更新为周五收盘版（超跌反弹复盘）
  - 需要更新的字段：
    - coreIndices: A股改为4060 +0.77% / 15620 +0.78% / 4035 +0.44%，恒生科技23,055→恒科涨3.23%对应4,598
    - coreFocus: 更新为周五核心关注（超跌反弹、非农爆冷、黄金V型反转、港股恒科大反弹、道指创历史新高）
    - coreAlert: 更新为周五收盘后重点提示
    - aShare: 完全重写为周五超跌反弹行情（指数数据、warning/warningContent改为反弹描述、sectors领涨领涨更新）
    - hkStock: 恒生科技从-0.40%改为+3.23%，恒指保持+0.76%，points更新
    - usStock: 保持不变（周四隔夜数据正确）
    - macro: 保持非农数据不变，可补充周五无重要数据
    - fxCommodity: 保持黄金$4,123 +2.30%不变，analysis微调
    - crypto: 保持不变
    - news: 更新新闻条目，补充周五相关新闻（超跌反弹、港股大涨等）
    - calendar: 更新为下周一（7月6日）经济日历（美国独立日假期后复市、中国外汇储备等）
    - outlook: 更新为周末/下周一视角（总结周五反弹、展望下周走势）
    - sources: 保持或微调
  - 参考DAYS数组中7月3日数据确保一致性
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-1.1: MORNING_REPORTS['2026-07-03'].aShare.indices[0].chg === 0.77（上证涨幅）
  - `programmatic` TR-1.2: MORNING_REPORTS['2026-07-03'].hkStock.indices中存在恒生科技+3.23%
  - `human-judgement` TR-1.3: 所有板块内容逻辑一致，无矛盾数据（如不能同时说暴跌和反弹）
- **Notes**: dateEn保持'2026-07-03 FRI'不变；美股数据是周四隔夜（周五凌晨收盘）所以保持不变

## [ ] Task 2: 更新版本号到v1.32.2
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - APP_VERSION改为'v1.32.2'
  - APP_VERSION_DATE改为'2026-07-04 16:00'
  - APP_RELEASE_NOTES改为'更新2026年7月3日（周五）金融市场早报数据：补充周五A股超跌反弹行情回顾，修正港股恒生科技指数涨幅（+3.23%），首页早报卡片与大盘情绪数据保持一致。'
  - VERSION_HISTORY数组头部添加v1.32.2条目
  - 同步更新versions.json
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: APP_VERSION === 'v1.32.2'
- **Notes**: 无

## [ ] Task 3: 同步文件并本地预览验证
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 执行文件同步：cp a-share-review-dashboard.html到site/index.html、site/preview.html、index.html，同步versions.json到site/
  - 确认本地HTTP服务器在8083端口运行（如果没有则启动）
  - 浏览器刷新验证：首页早报卡片显示7月3日周五数据（上证+0.77%），点击进入详情页无错误，港股恒生科技+3.23%
  - 控制台无JavaScript错误
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 本地服务器返回200状态码
  - `human-judgement` TR-3.2: 浏览器中早报卡片与大盘情绪卡片上证指数一致
  - `programmatic` TR-3.3: 控制台无TypeError等错误
- **Notes**: 不执行wrangler deploy或git push

## [ ] Task 4: 通知用户预览
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 提供本地预览URL（http://localhost:8083）给用户
  - 说明修改内容，请用户确认
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-4.1: 用户收到预览链接并可访问
- **Notes**: 等待用户确认后再部署
