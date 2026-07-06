# A股短线复盘看板 - 多任务修复与增强 实施计划

## [x] Task 1: 修复早报数据更新问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 检查`MORNING_REPORTS`对象中最新数据日期，确认是否需要添加新数据
  - 查看自动更新脚本`auto_update.py`是否支持早报数据更新
  - 如果需要，修改脚本或手动添加最新早报数据
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 确认早报页面显示最新日期（2026-07-06）的数据
- **Notes**: 早报数据目前是硬编码的，需要确认是否有自动更新机制

## [x] Task 2: headerCustom云端存储修复
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 检查`saveHeaderCustom`函数，确认已调用`scheduleCloudSync()`
  - 检查`loadFromCloud`函数，确认已加载`headerCustom`数据
  - 修复未登录状态下不触发云端同步的问题
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 登录后修改headerCustom，刷新页面数据保留
  - `human-judgement` TR-2.2: 登录后修改headerCustom，在另一设备登录后数据同步
- **Notes**: 当前代码已调用`scheduleCloudSync()`，需要确认登录后是否正常工作

## [/] Task 3: 日期选择器倒序排列
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 检查`renderDateButtons`函数中的日期排序逻辑
  - 确认`DAYS`数组已按倒序排列
  - 修复可能存在的排序问题
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 日期下拉框最新日期在最上方
- **Notes**: 当前代码已有倒序排序逻辑`sort((a, b) => b.date.localeCompare(a.date))`，需要确认是否正常工作

## [ ] Task 4: 浏览器密码提示修复
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 检查待办输入框`todoInput`的HTML属性
  - 添加`autocomplete="off"`和`autocapitalize="off"`属性
  - 移除可能触发密码保存提示的元素或事件
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-4.1: 在待办输入框输入内容时浏览器不提示保存密码
- **Notes**: 需要检查是否有其他因素导致密码提示（如定时刷新重新渲染表单）

## [ ] Task 5: 全数据云端存储完善
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 检查所有数据保存函数是否都调用了`scheduleCloudSync()`
  - 检查`saveToCloud`函数是否包含所有数据类型
  - 检查`loadFromCloud`函数是否加载所有数据类型
  - 确保登录时自动从云端同步数据
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 添加待办后刷新页面数据保留
  - `human-judgement` TR-5.2: 添加纪念日后刷新页面数据保留
  - `human-judgement` TR-5.3: 添加三省日记后刷新页面数据保留
  - `human-judgement` TR-5.4: 多设备登录数据同步
- **Notes**: 当前代码已有基本的云端同步机制，需要确保完整性

## [ ] Task 6: ECharts K线图实现
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 添加ECharts CDN引用
  - 修改`showTrend`函数，使用ECharts渲染K线图
  - 使用东方财富API获取K线数据（包含5日、10日、30日均线）
  - 实现时间范围切换功能（5日、30日、年线）
  - 实现图表收缩/展开交互
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-6.1: 点击股票卡片显示交互式K线图
  - `human-judgement` TR-6.2: K线图包含5日、10日、30日均线
  - `human-judgement` TR-6.3: 支持时间范围切换
  - `human-judgement` TR-6.4: 图表支持收缩/展开交互
- **Notes**: 需要使用东方财富的K线API，格式为`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt={period}&fqt={adjust}&beg={start}&end={end}`