# v1.32.2 周五数据完整更新 - Implementation Plan

## [ ] Task 1: 更新MORNING_REPORTS['2026-07-03']为周五收盘后版本
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将'2026-07-03'早报从盘前版（周四暴跌回顾）更新为周五收盘版（超跌反弹复盘）
  - 核心修改点：
    - coreIndices: 上证4060.00/+0.77%、深证15620.00/+0.78%、创业板4035.00/+0.44%；恒生科技4598.00/+3.23%
    - coreFocus: 超跌反弹、非农爆冷仅5.7万人、黄金V型反转$4123、港股恒科+3.23%、道指创历史新高52900、下周关注反弹延续性
    - coreAlert: 周五收盘后重点提示——超跌反弹情绪回暖，黄金/有色+创新药主线，半导体修复
    - aShare: 完全重写——超跌反弹，约3500只个股上涨，涨停120家/跌停20家，领涨：黄金/有色、创新药、半导体反弹、大金融企稳；缩量反弹
    - hkStock: 恒生科技-0.40%改为+3.23%（4,454.28→4,598.00），points更新为港股大涨
    - usStock: 保持不变（周四隔夜数据正确：道指+1.14%创历史新高，纳指-0.80%）
    - macro: 非农数据不变，补充周五无重要宏观数据、美国独立日休市
    - fxCommodity: 黄金$4,123+2.30%保持不变，微调analysis
    - crypto: 保持BTC $61,253+4.47%不变
    - news: 更新新闻条目（超跌反弹、港股大涨、非农爆冷影响、黄金创新高等）
    - calendar: 更新为下周一（7月6日）经济日历（美国独立日假期后复市、中国外汇储备、美联储会议纪要预期等）
    - outlook: 更新为周末/下周一视角
    - dateEn保持'2026-07-03 FRI'不变
  - 参考DAYS数组中7月3日数据确保一致性
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-1.1: MORNING_REPORTS['2026-07-03'].coreIndices中上证chg === 0.77
  - `programmatic` TR-1.2: MORNING_REPORTS['2026-07-03'].aShare.indices[0].chg === 0.77
  - `programmatic` TR-1.3: MORNING_REPORTS['2026-07-03'].hkStock.indices中恒生科技chg === 3.23
  - `human-judgement` TR-1.4: aShare内容描述超跌反弹而非暴跌，与DAYS数据一致

## [ ] Task 2: 确认DAYS数组和renderThemeCard修复
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 验证DAYS数组中'2026-07-03'数据完整存在（上证4060/+0.77%等）
  - 验证renderThemeCard函数已包含isPctValid空安全检查
  - 这两项在v1.32.1本地修改中已完成，只需验证确认
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: DAYS数组最后一个元素date === '2026-07-03'
  - `programmatic` TR-2.2: renderThemeCard函数包含typeof t.pct === 'number'检查

## [ ] Task 3: 更新版本号到v1.32.2
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - APP_VERSION改为'v1.32.2'
  - APP_VERSION_DATE改为'2026-07-04 16:00'
  - APP_RELEASE_NOTES改为'补充2026年7月3日（周五）完整交易日数据：更新金融市场早报为周五收盘后版本（超跌反弹行情），修正港股恒生科技指数涨幅（+3.23%）；修复大盘情绪详情页无法打开致命bug；首页持仓总览、大盘情绪、早报三大卡片数据一致。'
  - VERSION_HISTORY数组头部添加v1.32.2条目
  - 同步更新versions.json（注意：v1.32.1的deploy_url保留但补充说明，v1.32.2添加新条目）
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: APP_VERSION === 'v1.32.2'

## [ ] Task 4: 同步文件并本地预览验证
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 同步文件：cp a-share-review-dashboard.html site/index.html && cp a-share-review-dashboard.html site/preview.html && cp a-share-review-dashboard.html index.html && cp versions.json site/versions.json
  - 确认本地HTTP服务器在8083运行
  - 浏览器验证：
    - 日期选择器有"2026-07-03 周五"选项
    - 首页三个卡片（持仓/大盘/早报）数据一致（上证+0.77%）
    - 点击大盘情绪详情页无崩溃
    - 点击早报详情页，港股恒生科技+3.23%
    - 控制台无错误
    - 版本显示v1.32.2
  - 提供预览URL给用户
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 本地服务器localhost:8083返回200
  - `human-judgement` TR-4.2: 首页三个卡片周五数据一致
  - `programmatic` TR-4.3: goMarket()不抛出异常
  - `programmatic` TR-4.4: 控制台无TypeError
  - `programmatic` TR-4.5: 不执行部署命令
- **Notes**: 等待用户确认后再部署
