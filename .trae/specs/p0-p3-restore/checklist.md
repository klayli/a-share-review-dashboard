# P0-P3数据自动更新功能恢复 - Verification Checklist

- [ ] Checkpoint 1: CN_HOLIDAYS/CN_WORKDAYS包含2026年全年法定节假日和调休工作日
- [ ] Checkpoint 2: isTradingDay()正确判断交易日（周末返回false，法定节假日false，调休上班true）
- [ ] Checkpoint 3: 东财+新浪双数据源获取函数存在，差异>0.5%时console.warn
- [ ] Checkpoint 4: snapshotClose()函数存在，能拉取指数+股票收盘价并写入DAYS
- [ ] Checkpoint 5: saveCloseSnapshot/loadStoredCloseSnapshots实现localStorage持久化
- [ ] Checkpoint 6: 基金确认净值更新时间为22:00（非22:30）
- [ ] Checkpoint 7: 15:05自动归档定时器存在，每分钟检查
- [ ] Checkpoint 8: 页面加载时自动检查是否需要补录归档（15:05后未归档则补录）
- [ ] Checkpoint 9: SW CACHE_NAME更新为新版本
- [ ] Checkpoint 10: APP_VERSION更新为v1.35.0，VERSION_HISTORY新增条目
- [ ] Checkpoint 11: 本地预览无JS错误，周五(7/3)数据显示正确
- [ ] Checkpoint 12: 控制台可调用isTradingDay('2026-07-03')返回true
