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

## [ ] Task 2: 更新版本号和版本说明
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 将APP_VERSION更新为v1.32.1
  - 更新APP_VERSION_DATE为当前北京时间
  - 更新APP_RELEASE_NOTES说明修复内容
  - 在VERSION_HISTORY数组头部添加v1.32.1记录
  - 更新versions.json添加v1.32.1版本记录
- **Acceptance Criteria Addressed**: [NFR-2, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-2.1: APP_VERSION值为v1.32.1
  - `programmatic` TR-2.2: VERSION_HISTORY第一条是v1.32.1
  - `human-judgement` TR-2.3: 版本说明清晰描述修复内容

## [ ] Task 3: 同步文件并本地测试验证
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 按项目约定同步主文件到site/index.html、site/preview.html、index.html
  - 同步versions.json到site/versions.json
  - 启动本地HTTP服务器
  - 在浏览器中测试：首页大盘情绪卡片点击、面包屑点击、各历史日期详情页
  - 检查控制台无JavaScript错误
- **Acceptance Criteria Addressed**: [AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `programmatic` TR-3.1: 调用goMarket()不抛出异常，currentPage变为'market'
  - `programmatic` TR-3.2: 浏览器控制台无TypeError或其他未捕获异常
  - `human-judgement` TR-3.3: 大盘情绪详情页所有板块正常显示
  - `human-judgement` TR-3.4: 切换6/23-7/2所有日期都能正常打开详情页

## [ ] Task 4: 部署到GitHub和Cloudflare Pages
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - Git提交所有更改（规范提交信息）
  - 推送到GitHub main分支
  - 使用wrangler部署到Cloudflare Pages生产环境
- **Acceptance Criteria Addressed**: [FR-3, FR-4]
- **Test Requirements**:
  - `programmatic` TR-4.1: git push origin main成功
  - `programmatic` TR-4.2: wrangler pages deploy成功返回部署URL
  - `human-judgement` TR-4.3: 线上地址可正常访问大盘情绪详情页
