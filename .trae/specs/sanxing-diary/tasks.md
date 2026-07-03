# 三省日记 - 实现计划（任务分解）

## [ ] Task 1: 数据层与基础设施
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在常量区新增日记相关常量和默认数据结构
  - 实现CRUD函数：`getDiaries()`、`saveDiaries()`、`addDiary()`、`updateDiary()`、`deleteDiary()`
  - 实现AI配置存取：`getAIConfig()`、`saveAIConfig()`（存储baseUrl/apiKey/model）
  - 实现风格样本存取：`getStyleSamples()`、`saveStyleSamples()`
  - localStorage key使用 `diary_${currentUser}`、`ai_config_${currentUser}`、`style_samples_${currentUser}` 按用户隔离
  - 在BREADCRUMB_SECTIONS中新增日记项：`{ key: 'sanxingDetail', label: '日记', action: 'goSanxing()' }`
  - 实现路由函数`goSanxing()`，新增currentPage='sanxingDetail'
  - 在render()主路由中增加sanxingDetail分支
- **Acceptance Criteria Addressed**: AC-1, AC-9
- **Test Requirements**:
  - `programmatic` TR-1.1: getDiaries()在无数据时返回空数组，有数据时正确解析JSON
  - `programmatic` TR-1.2: addDiary()生成id(Date.now)并保存到localStorage，getDiaries()能读取
  - `programmatic` TR-1.3: updateDiary()可更新原文/润色文内容
  - `programmatic` TR-1.4: deleteDiary()正确删除指定id条目
  - `programmatic` TR-1.5: AI配置和风格样本按用户隔离存储
  - `human-judgement` TR-1.6: 面包屑中"日记"链接点击后跳转到日记页面
- **Notes**: 参考getTodos/saveTodos/addTodo的实现模式（第4630-4667行）

## [ ] Task 2: 首页日记卡片（快捷新增+近6条概要）
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 在首页`renderHome()`函数中，待办清单卡片之后（或纪念日之后，根据hideAnni判断）新增"三省吾身"卡片
  - 卡片结构参照待办清单：h2标题 + 快捷输入栏(input+添加按钮) + 日记列表容器 + 统计信息 + "查看全部 (N) →"
  - 首页列表只显示最近6条，每条格式：`📅 日期 · 内容前30字...`
  - 实现`renderDiaryListHome()`函数渲染首页列表
  - 快捷添加：输入框回车或点击按钮调用addDiary()，原文为输入内容，AI润色字段为空
  - 卡片使用与待办清单相同的CSS类（home-card/home-card-body/card-arrow/tag等）
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-9
- **Test Requirements**:
  - `programmatic` TR-2.1: 登录用户可见日记卡片，未登录不可见
  - `programmatic` TR-2.2: 快捷输入并添加后，新日记出现在列表顶部
  - `human-judgement` TR-2.3: 卡片样式与待办清单一致，深色/亮色主题正常
  - `human-judgement` TR-2.4: "查看全部"按钮点击跳转日记详情页
  - `human-judgement` TR-2.5: 超过6条时只显示最近6条
- **Notes**: 参考待办卡片代码（第6474-6487行）

## [ ] Task 3: 日记详情页（列表+新增/编辑/删除）
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 实现`renderSanxingDetail()`函数渲染完整日记页面
  - 页面结构：返回首页按钮+面包屑 + 标题 + 新增日记区域(textarea原文+"AI润色"按钮+"保存"按钮) + 日记列表（按日期倒序，每条显示日期、原文、AI润色文、编辑/删除按钮）
  - 实现`renderDiaryListDetail()`函数渲染详情页完整列表
  - 编辑功能：点击编辑展开textarea可修改原文和润色文
  - 删除功能：点击×弹出确认后删除
  - 新增日记时默认日期为今天，原文为空，等待用户输入
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-9
- **Test Requirements**:
  - `programmatic` TR-3.1: 日记列表按日期倒序排列
  - `programmatic` TR-3.2: 删除日记后列表即时更新
  - `human-judgement` TR-3.3: 编辑功能正常，修改后保存生效
  - `human-judgement` TR-3.4: 页面布局清晰，日期、原文、润色文区分明确
- **Notes**: 参考renderTodoDetail/renderTodoListDetail模式（第6515-6548行）

## [ ] Task 4: 原文/AI润色文对比展示样式
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 在详情页日记列表中，每条日记卡片分两区域展示：
    - "✏️ 原始内容"区域：普通文字样式，可点击编辑
    - "✨ AI润色"区域：不同背景色（如淡金色/淡蓝色）区分，无润色内容时显示"点击'AI润色'生成"占位文字
  - 移动端自动切换为上下排列，桌面端可左右排列
  - 润色文区域提供"采纳"按钮（将润色文替换原文）和"重新生成"按钮
  - 新增CSS类：diary-original、diary-polished、diary-compare等
- **Acceptance Criteria Addressed**: AC-4, AC-9
- **Test Requirements**:
  - `human-judgement` TR-4.1: 原文和润色文视觉上明显区分
  - `human-judgement` TR-4.2: 移动端上下排列不溢出
  - `programmatic` TR-4.3: 无润色内容时显示占位提示文字
- **Notes**: 样式与现有card/tag/badge风格保持一致

## [ ] Task 5: AI配置面板与API调用
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 实现AI配置界面：在日记详情页设置区域（或独立弹窗）包含Base URL、API Key、Model三个输入框+保存/测试按钮
  - 默认值提示：Base URL默认`https://api.deepseek.com/v1`（DeepSeek支持CORS），Model默认`deepseek-chat`
  - 实现`polishDiary(diaryId, originalText)`函数：
    - 读取AI配置，若未配置则弹出配置提示
    - 构造prompt：system提示"你是一位专业的文字润色助手..."，包含用户风格样本（前3000字）
    - user消息传入原始日记内容，要求"请模仿提供的风格样本润色以下日记内容，保持原意但语言更流畅优美，润色后只输出润色后的正文，不要加任何解释"
    - fetch POST到`${baseUrl}/chat/completions`，Header带Authorization
    - 处理流式/非流式响应，更新按钮loading状态
    - 返回润色后的文本，更新到日记条目并重新渲染
  - 错误处理：网络错误、401未授权、额度不足等不同错误给出对应提示toast
- **Acceptance Criteria Addressed**: AC-3, AC-5, AC-8
- **Test Requirements**:
  - `programmatic` TR-5.1: 未配置API Key时点击润色弹出提示，不报错
  - `programmatic` TR-5.2: API配置保存后localStorage可读取
  - `human-judgement` TR-5.3: 润色过程中按钮显示loading状态
  - `human-judgement` TR-5.4: 润色完成后文字出现在润色区域
  - `human-judgement` TR-5.5: 错误时toast提示友好
- **Notes**: 首次实现可先用非流式响应简化开发，后续可优化为流式

## [ ] Task 6: 风格样本管理
- **Priority**: medium
- **Depends On**: Task 5
- **Description**:
  - 在AI配置区域添加"我的文风样本"管理区
  - 提供textarea供用户粘贴历史作品（支持3-10篇，总字数建议1000-5000字）
  - 保存按钮将样本存入localStorage
  - 润色时将样本截取前3000字注入system prompt作为风格参考
  - prompt模板：`以下是用户过往的写作样本，请模仿其文风、语气、用词习惯进行润色：\n\n{样本内容}\n\n现在请润色以下日记：`
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 风格样本保存后可读取
  - `human-judgement` TR-6.2: 润色时prompt包含风格样本（通过console.log或调试验证）
- **Notes**: 样本过长时截取前3000字符，避免超出token限制

## [ ] Task 7: 同步到一本日记（复制+下载）
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - 在每条日记的润色文区域底部添加两个操作按钮："📋 复制内容"和"📥 下载TXT"
  - "复制内容"：格式化日记为Markdown文本（包含日期、原文、润色文），调用navigator.clipboard.writeText()，成功后toast提示"已复制！打开一本日记粘贴即可 🎉"
  - "下载TXT"：生成Blob并创建下载链接，文件名为`日记_YYYY-MM-DD.txt`，内容为纯文本格式的日记
  - Markdown格式示例：
    ```
    # 2026-07-03 日记

    ## 原文
    {original text}

    ## 润色
    {polished text}
    ```
  - 批量导出：详情页顶部添加"导出全部TXT"按钮，将所有日记打包到一个txt文件
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 点击复制后剪贴板内容格式正确（可通过clipboard API验证）
  - `programmatic` TR-7.2: 下载的文件名格式正确
  - `human-judgement` TR-7.3: 复制成功后toast提示清晰
- **Notes**: 由于一本日记无公开API，此为最实用的同步方式；用户可在手机端浏览器复制后切到一本日记App粘贴

## [ ] Task 8: CSS样式与主题兼容
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 4
- **Description**:
  - 确保所有新增CSS类兼容现有深色/亮色主题的CSS变量（--bg, --card, --text, --border, --blue等）
  - 新增CSS类：diary-input-bar、diary-item、diary-date、diary-original、diary-polished、diary-actions、diary-empty、ai-config-panel、style-samples、loading-dots
  - 按钮样式复用现有btn类
  - 响应式适配：textarea在移动端宽度100%，两栏对比在移动端变为上下排列
- **Acceptance Criteria Addressed**: AC-9, NFR-5
- **Test Requirements**:
  - `human-judgement` TR-8.1: 深色模式下文字清晰、边界分明
  - `human-judgement` TR-8.2: 亮色模式下视觉协调
  - `human-judgement` TR-8.3: 移动端（375px宽度）布局正常无横向滚动
- **Notes**: 参考待办清单CSS：todo-add-bar、todo-item、todo-check、todo-text、todo-del、todo-empty

## [ ] Task 9: 版本号更新与文件同步
- **Priority**: high
- **Depends On**: Task 1-8全部完成
- **Description**:
  - 更新APP_VERSION为v1.30.0，更新APP_VERSION_DATE和APP_RELEASE_NOTES
  - 在VERSION_HISTORY头部添加v1.30.0版本记录（使用分号分隔，不使用序号或圆点）
  - 更新versions.json，添加v1.30.0条目
  - 执行同步命令：cp a-share-review-dashboard.html site/index.html && cp a-share-review-dashboard.html site/preview.html && cp a-share-review-dashboard.html index.html && cp versions.json site/versions.json
- **Acceptance Criteria Addressed**: 全部
- **Test Requirements**:
  - `programmatic` TR-9.1: 所有文件大小一致，版本号正确显示
  - `programmatic` TR-9.2: JS语法无错误（node -e快速验证）
