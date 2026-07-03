# 三省日记增强 - 实现计划

## [ ] Task 1: AI配置面板增强（预置服务商推荐）
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改AI配置弹窗HTML（id="aiConfigModal"），在表单上方添加"推荐免费服务商"区域
  - 添加预置服务商数据数组：
    - DeepSeek: baseUrl=https://api.deepseek.com/v1, model=deepseek-chat, 注册地址=https://platform.deepseek.com/
    - 智谱AI(GLM): baseUrl=https://open.bigmodel.cn/api/paas/v4, model=glm-4-flash, 注册地址=https://open.bigmodel.cn/
    - 硅基流动(SiliconFlow): baseUrl=https://api.siliconflow.cn/v1, model=deepseek-ai/DeepSeek-V3, 注册地址=https://cloud.siliconflow.cn/
  - 每个服务商显示：名称、简介（"新用户免费500万token"等）、"一键填充"按钮、"获取API Key"链接按钮
  - 一键填充按钮点击后自动填充baseUrl和model到输入框
  - 弹窗打开时默认已填充DeepSeek配置（getAIConfig()默认值已正确）
  - 添加小提示文字："以上服务商均提供免费额度，注册后在控制台创建API Key即可使用"
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-1.1: 预置服务商数据结构正确，有name/baseUrl/model/url字段
  - `human-judgement` TR-1.2: 配置弹窗中推荐区域视觉清晰，按钮可用
  - `human-judgement` TR-1.3: 一键填充正确填充baseUrl和model输入框

## [ ] Task 2: 原文区域添加复制/下载按钮
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改renderDiaryListDetail()中日记条目的HTML结构
  - 在原文区域(.diary-original)底部添加操作按钮区域
  - 按钮：📋 复制原文（调用copyOriginal(id)函数）、📥 下载原文（调用downloadOriginal(id)函数）
  - 实现copyOriginal(id)：只复制原文内容，调用navigator.clipboard.writeText(diary.original)，toast提示"原文已复制"
  - 实现downloadOriginal(id)：只下载原文为TXT，文件名三省_日期_原文.txt，内容为纯原文
  - 注意：现有润色区域的"复制"按钮改为"📋 复制润色"，"下载"按钮改为"📥 下载润色"
  - 润色区域的复制只复制润色内容，下载只下载润色内容
  - 考虑添加一个"📋 复制全部"按钮复制完整Markdown格式（原文+润色）
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 点击复制原文后剪贴板内容等于diary.original
  - `programmatic` TR-2.2: 下载原文文件名格式正确
  - `human-judgement` TR-2.3: 按钮在原文区域和润色区域位置清晰，不混淆

## [ ] Task 3: AI润色内容可编辑
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 将润色区域的内容展示从`<div class="diary-content">`改为`<textarea>`
  - textarea样式：与现有样式一致，无边框/背景透明，自动高度，继承字体
  - 添加CSS类`.diary-editable`样式
  - textarea属性：readonly状态切换？不，直接可编辑
  - 编辑后自动保存：失焦(blur)事件触发updateDiary(id, {polished: textarea.value})
  - Ctrl+S快捷键也触发保存
  - 无润色内容时textarea显示placeholder="点击'AI润色'生成润色内容，或直接在此输入..."
  - 原文区域也改为可编辑textarea？保持一致性——是的，原文也改为可编辑textarea，失焦自动保存original字段
  - 原文textarea placeholder="记录你的所思所感..."
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 润色文textarea可直接输入编辑
  - `programmatic` TR-3.2: 编辑失焦后localStorage数据更新
  - `human-judgement` TR-3.3: textarea视觉上与原来的div风格一致，不突兀
  - `human-judgement` TR-3.4: 原文区域也可编辑

## [ ] Task 4: CSS适配和版本更新
- **Priority**: high
- **Depends On**: Task 1-3
- **Description**:
  - 新增textarea.diary-editable样式：width:100%, min-height:60px, border:none, background:transparent, color:inherit, font:inherit, line-height:1.7, resize:vertical, padding:0, outline:none
  - textarea聚焦时添加轻微边框高亮效果
  - 推荐服务商区域CSS：卡片式布局，每个服务商一行，flex排列
  - 更新版本号为v1.31.0
  - 更新APP_VERSION_DATE、APP_RELEASE_NOTES
  - VERSION_HISTORY添加v1.31.0
  - versions.json更新
  - 文件同步到site/
- **Test Requirements**:
  - `programmatic` TR-4.1: JS语法无错误
  - `programmatic` TR-4.2: 文件同步完成，大小一致
  - `human-judgement` TR-4.3: 深色/亮色主题下textarea和服务商推荐区域显示正常
