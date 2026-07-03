# 大盘情绪详情页Bug修复 - The Implementation Plan

## [ ] Task 1: 修复renderThemeCard函数空安全问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改a-share-review-dashboard.html中的renderThemeCard函数（约line 8052-8062）
  - 对t.pct字段添加typeof检查，当pct不是number类型（undefined/null）时，不调用toFixed，显示"—"或不显示百分比
  - 确保pct有值时保持原有显示样式不变（涨红跌绿颜色、+/-号、2位小数）
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `programmatic` TR-1.1: 当t.pct为undefined时，函数不抛出异常，返回有效的HTML字符串
  - `programmatic` TR-1.2: 当t.pct为数字（如2.71）时，正确显示"+2.71%"和对应颜色
  - `programmatic` TR-1.3: 当t.pct为负数（如-3.85）时，正确显示"-3.85%"和对应颜色
  - `human-judgement` TR-1.4: pct缺失时UI布局正常，无错乱

## [ ] Task 2: 补充2026-07-03（周五）DAYS数组数据
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在DAYS数组末尾（7月2日数据之后）添加2026-07-03（周五）的完整交易日数据
  - 参考7月1日和7月2日的数据结构，包含所有必填字段：date、weekday、price、prev、idx、theme、themeDesc、summary、limitUp、limitDown、sealRate、sentiment、strength、earnEffect、volume、ud、direction、sectorName、sectorBadge、drivers、leader、sectorStrength、sectorReason、watchlist、overnight、strategy、hotThemes、sectorHeat
  - 根据7月3日早报信息构建合理数据：隔夜美股道指涨1.14%创历史新高纳指跌0.80%、港股恒生科技涨3.23%、黄金V型反转；A股7月2日暴跌后周五超跌反弹，沪指收复4050点，创业板企稳反弹
  - 持仓价格（price/prev）根据7月2日数据合理更新
  - hotThemes条目不需要pct字段（因为renderThemeCard已做防御）
  - sectorHeat需要有pct字段（用于板块热力图渲染）
  - 日期选择器会自动从DAYS数组生成，无需额外修改
- **Acceptance Criteria Addressed**: [AC-6, AC-7]
- **Test Requirements**:
  - `programmatic` TR-2.1: DAYS数组中存在date为'2026-07-03'的条目
  - `programmatic` TR-2.2: 该条目包含所有必填字段，无缺失
  - `human-judgement` TR-2.3: 数据内容与早报信息逻辑一致
  - `human-judgement` TR-2.4: 7月3日大盘情绪详情页正常渲染

## [ ] Task 3: 更新版本号和版本说明
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 将APP_VERSION更新为v1.32.1
  - 更新APP_VERSION_DATE为当前北京时间（2026-07-04）
  - 更新APP_RELEASE_NOTES说明修复内容：修复大盘情绪详情页无法打开bug（renderThemeCard空指针）；补充7月3日周五交易日数据
  - 在VERSION_HISTORY数组头部添加v1.32.1记录
  - 更新versions.json添加v1.32.1版本记录
- **Acceptance Criteria Addressed**: [NFR-2, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: APP_VERSION值为v1.32.1
  - `programmatic` TR-3.2: VERSION_HISTORY第一条是v1.32.1
  - `human-judgement` TR-3.3: 版本说明清晰描述修复内容

## [ ] Task 4: 同步文件并本地测试验证
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 按项目约定同步主文件到site/index.html、site/preview.html、index.html
  - 同步versions.json到site/versions.json
  - 启动本地HTTP服务器（或使用已有8083端口）
  - 在浏览器中测试：首页大盘情绪卡片点击、面包屑点击、各历史日期详情页、7月3日周五数据
  - 检查控制台无JavaScript错误
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `programmatic` TR-4.1: 调用goMarket()不抛出异常，currentPage变为'market'
  - `programmatic` TR-4.2: 浏览器控制台无TypeError或其他未捕获异常
  - `human-judgement` TR-4.3: 大盘情绪详情页所有板块正常显示
  - `human-judgement` TR-4.4: 切换6/23-7/3所有日期都能正常打开详情页
  - `human-judgement` TR-4.5: 日期选择器中可以看到并选择2026-07-03周五

## [ ] Task 5: 部署到GitHub和Cloudflare Pages
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - Git提交所有更改（规范提交信息）
  - 推送到GitHub main分支
  - 使用wrangler部署到Cloudflare Pages生产环境
- **Acceptance Criteria Addressed**: [FR-3, FR-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: git push origin main成功
  - `programmatic` TR-5.2: wrangler pages deploy成功返回部署URL
  - `human-judgement` TR-5.3: 线上地址可正常访问大盘情绪详情页，7月3日数据可见
