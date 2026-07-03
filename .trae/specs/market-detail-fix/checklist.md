# 大盘情绪详情页Bug修复 - Verification Checklist

## 代码修复
- [ ] renderThemeCard函数对t.pct添加typeof === 'number'检查
- [ ] pct为undefined/null时显示"—"或不显示百分比，不调用toFixed
- [ ] pct为有效数字时保持原有样式：正负号、2位小数、涨红跌绿颜色
- [ ] 修复代码风格与项目现有代码保持一致

## 7月3日周五数据补充
- [ ] DAYS数组添加2026-07-03（周五）条目
- [ ] 包含所有必填字段：date/weekday/price/prev/idx/theme/themeDesc/summary/limitUp/limitDown/sealRate/sentiment/strength/earnEffect/volume/ud/direction/sectorName/sectorBadge/drivers/leader/sectorStrength/sectorReason/watchlist/overnight/strategy/hotThemes/sectorHeat
- [ ] 数据逻辑与早报一致：隔夜美股道指涨纳指跌、港股反弹、黄金反弹
- [ ] hotThemes数据格式正确（可无pct字段）
- [ ] sectorHeat包含pct字段用于热力图渲染
- [ ] price/prev持仓价格根据前一日合理更新

## 版本更新
- [ ] APP_VERSION更新为v1.32.1
- [ ] APP_VERSION_DATE更新为2026-07-04北京时间
- [ ] APP_RELEASE_NOTES包含：修复大盘情绪详情页无法打开bug；补充7月3日周五交易日数据
- [ ] VERSION_HISTORY数组头部添加v1.32.1版本记录
- [ ] versions.json添加v1.32.1版本条目

## 本地测试
- [ ] 主文件同步到site/index.html、site/preview.html、index.html
- [ ] versions.json同步到site/versions.json
- [ ] 本地HTTP服务器可正常访问
- [ ] 浏览器控制台无JavaScript错误（特别是TypeError: Cannot read properties of undefined）
- [ ] 首页大盘情绪卡片点击可进入详情页
- [ ] 面包屑"大盘情绪"链接点击可进入详情页
- [ ] 当日数据快照板块正常显示
- [ ] 大盘&情绪板块正常显示
- [ ] 今日主线板块正常显示
- [ ] 板块热力图正常显示
- [ ] 备选标的正常显示
- [ ] 当日热点题材汇总正常显示（无pct字段时不崩溃）
- [ ] 隔夜单计划正常显示
- [ ] 日期选择器包含2026-07-03周五选项
- [ ] 切换到7月3日周五，大盘情绪详情页正常显示
- [ ] 切换所有历史日期（6/23、6/24、6/25、6/26、6/29、6/30、7/1、7/2、7/3）的大盘情绪详情页都正常

## 部署
- [ ] Git提交信息规范（release v1.32.1: 修复大盘情绪详情页bug并补充周五数据）
- [ ] 成功推送到GitHub main分支
- [ ] 成功部署到Cloudflare Pages
- [ ] 线上URL可正常访问大盘情绪详情页
- [ ] 线上日期选择器可选择7月3日周五并正常显示数据
