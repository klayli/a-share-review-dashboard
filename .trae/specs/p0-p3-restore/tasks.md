# P0-P3数据自动更新功能恢复 - Implementation Plan

## [ ] Task 1: 添加2026年A股交易日历（CN_HOLIDAYS/CN_WORKDAYS）+ isTradingDay()/isTradingHours()
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 添加2026年全年法定节假日表（元旦、春节、清明、劳动节、端午、中秋、国庆）
  - 添加2026年调休工作日表（周末上班的日期）
  - 实现isTradingDay(dateStr)：判断是否为交易日
  - 实现isTradingHours()：判断当前是否在9:30-15:00交易时段
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: isTradingDay('2026-07-03')返回true（周五）
  - `programmatic` TR-1.2: isTradingDay('2026-07-04')返回false（周六）
  - `programmatic` TR-1.3: 法定节假日返回false，调休周末工作日返回true

## [ ] Task 2: 实现多数据源价格获取（东财+新浪双源）+ 交叉校验
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 实现fetchPriceEastmoney(secid)：从东财API获取最新价
  - 实现fetchPriceSina(sinaCode)：从新浪API获取最新价
  - 实现getVerifiedPrice(secid, sinaCode)：双源获取，差异>0.5%时console.warn，优先东财
  - 实现getIndexPrices()：获取三大指数（东财+新浪双源校验）
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: 东财和新浪价格差异<0.5%时正常返回
  - `programmatic` TR-2.2: 差异>0.5%时输出console.warn
  - `programmatic` TR-2.3: 东财失败时降级使用新浪

## [ ] Task 3: 实现snapshotClose()收盘归档函数 + localStorage持久化
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - 实现snapshotClose()：15:05后自动拉取当日指数+股票收盘价，凝固到DAYS数组
  - 实现saveCloseSnapshot(date, data)：保存归档到localStorage('closeSnapshots')
  - 实现loadStoredCloseSnapshots()：页面加载时恢复已归档数据
  - 归档后标记closed=true，防止重复归档
  - 确保归档时prev价格正确设置为上一交易日收盘价
  - 同时更新INTRADAY_PNL收盘数据
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 交易日15:05后snapshotClose()写入DAYS数组
  - `programmatic` TR-3.2: 数据保存到localStorage，刷新后恢复
  - `programmatic` TR-3.3: 已归档日期不重复归档
  - `programmatic` TR-3.4: 非交易日不执行归档

## [ ] Task 4: 修复基金22:00确认净值拉取时间 + 三态管理
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 将startFundNavAutoRefresh()中22:30改为22:00
  - 确保refreshFundNavs()三态逻辑正确：
    - 盘前(0:00-9:25)：显示上一交易日净值
    - 交易时段(9:30-15:00)：显示盘中估值(gsz)
    - 盘后(15:05-22:00)：仍显示上一交易日净值（当日净值未出）
    - 22:00后：拉取并显示当日确认净值(dwjz)
  - 确保localStorage缓存正常工作
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 22:00触发确认净值拉取（非22:30）
  - `programmatic` TR-4.2: 交易时段使用估值，盘后使用确认值

## [ ] Task 5: 添加15:05自动归档定时器 + 整合到启动流程
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 在startMarketAutoSave()或新增定时器中，每分钟检查是否到15:05
  - 15:05-15:30之间且是交易日、未归档时，触发snapshotClose()
  - 页面加载时，如果当前时间>15:05且当日是交易日但未归档，立即触发归档（补录）
  - 初始化时调用loadStoredCloseSnapshots()恢复历史归档
  - 更新SW CACHE_NAME为新版本号
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 页面加载在15:05后自动补录当日归档
  - `human-judgement` TR-5.2: 版本号更新后SW缓存更新
  - `programmatic` TR-5.3: 周末/节假日不触发归档

## [ ] Task 6: 版本号更新 + 本地验证
- **Priority**: high
- **Depends On**: Task 1-5
- **Description**:
  - 更新APP_VERSION到v1.35.0
  - 更新VERSION_HISTORY
  - 更新SW CACHE_NAME
  - 同步文件到site/index.html等副本
  - 本地启动服务器验证
- **Acceptance Criteria Addressed**: AC-1~AC-5
- **Test Requirements**:
  - `human-judgement` TR-6.1: 页面正常加载，无JS错误
  - `programmatic` TR-6.2: isTradingDay等函数可在控制台调用验证
