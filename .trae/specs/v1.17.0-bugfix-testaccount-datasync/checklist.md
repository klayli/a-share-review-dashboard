# A股短线复盘看板 v1.17.0 - Verification Checklist

## 代码质量检查
- [ ] APP_RELEASE_NOTES行末无双分号
- [ ] .trae/rules/project.md同步命令包含cp index.html步骤
- [ ] 代码中不再有`admin123`明文出现在版本说明中（AUTH_ACCOUNTS配置除外）
- [ ] 所有文件同步后内容一致（diff验证）

## 板块热力图Bug修复验证
- [ ] 点击"刷新数据"后，板块热力图涨跌幅显示正确百分比（如+2.35%而非+0.02%）
- [ ] 热力图颜色深浅与涨跌幅幅度匹配（大涨深色大尺寸，小涨浅色小尺寸）
- [ ] 上涨板块红色系，下跌板块绿色系，颜色正确
- [ ] 有涨停股的板块显示龙头股名称（非"龙头: —"）
- [ ] 首页"领涨板块"区域的百分比与热力图一致
- [ ] 板块排序按涨跌幅绝对值从大到小排列

## 版本说明检查
- [ ] v1.15.0版本说明中不包含密码信息
- [ ] VERSION_HISTORY中v1.15.0 notes已修改
- [ ] 根目录versions.json中v1.15.0 summary已修改
- [ ] site/versions.json中v1.15.0 summary已修改

## test账号验证
- [ ] 使用test/test可成功登录，显示"测试用户"
- [ ] 页面显示"🧪 测试模式"标识
- [ ] test账号持仓数据为模拟数据（与admin不同）
- [ ] test账号可访问所有5个页面（首页/持仓总览/大盘情绪/待办清单/纪念日）
- [ ] test账号添加的待办事项在admin账号下不可见
- [ ] test账号添加的纪念日在admin账号下不可见
- [ ] test账号下三大指数据正常实时刷新
- [ ] 退出test登录admin后，admin数据完全正常
- [ ] 未登录状态下数据正常遮罩（显示****）

## Worker后端验证
- [ ] worker/wrangler.toml配置正确（name、main、kv_namespaces、triggers.crons）
- [ ] Worker可本地启动（wrangler dev）
- [ ] Worker API `/api/daily/{date}` 返回合法JSON
- [ ] 返回JSON包含必要字段：date, idx, sectorHeat, limitUp, limitDown, volume, theme, sectorName, topSectors, sentiment, strategy
- [ ] sectorHeat中pct值为正确百分比格式（如2.35表示+2.35%）
- [ ] sectorHeat中leaders字段有值（非空字符串，有涨停股时显示股票名）
- [ ] Cron Trigger配置为工作日UTC 2:00/6:00/7:05（即北京时间10:00/14:00/15:05）
- [ ] CORS头设置允许Pages域名访问
- [ ] API请求失败时返回合适的错误码（不崩溃）

## 前端API适配验证
- [ ] 页面加载时尝试从Worker API获取当日数据
- [ ] Worker API正常时，当日数据从Worker获取并展示
- [ ] Worker API不可用时（404/网络错误），降级为内置数据，页面不报错
- [ ] 三大指数在交易时段持续实时刷新（每10秒），不被Worker缓存覆盖
- [ ] 手动点击"刷新数据"按钮时，板块/涨停等数据从前端直接获取并覆盖Worker数据
- [ ] 数据更新时间正确显示数据来源（API快照/实时数据/内置数据）
- [ ] test账号下Worker API也正常工作（市场数据为真实数据，持仓为模拟数据）

## 部署验证
- [ ] 版本号已更新为v1.17.0，VERSION_HISTORY有新条目
- [ ] versions.json current为v1.17.0
- [ ] 前端已部署到Cloudflare Pages
- [ ] Worker已部署到Cloudflare
- [ ] Git已提交并推送到main分支
- [ ] 线上页面https://a-share-review-dashboard.pages.dev可正常访问
- [ ] 线上test账号可登录
- [ ] 线上页面刷新数据后热力图显示正确
