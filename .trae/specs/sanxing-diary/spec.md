# 三省日记 - 产品需求文档（PRD）

## Overview
- **Summary**: 在A股短线复盘看板中新增"三省"日记功能模块，支持用户快速录入日记内容，通过AI进行文本润色（模仿用户个人写作风格），展示原始内容与AI润色内容对比，并提供一键复制/导出功能以便同步到"一本日记"App。
- **Purpose**: 帮助用户养成每日三省吾身的记录习惯，借助AI能力降低写作门槛，同时将AI润色后的优质内容便捷同步到用户已有的"一本日记"App中。
- **Target Users**: 已使用A股复盘看板的投资日记用户，同时也是"一本日记"App用户，希望快速记录市场感悟/交易心得/生活随笔，并通过AI润色提升文字质量。

## Goals
- 提供便捷的日记录入入口（首页卡片快捷输入+详情页完整编辑器）
- AI文本润色功能：基于用户历史作品学习其写作风格，对原始输入进行润色完善
- 原始内容与AI润色内容双栏/对比展示，用户可选择采纳或重新生成
- AI润色后的内容可一键复制或下载为TXT/Markdown，便于导入"一本日记"
- 首页卡片展示近6条日记概要，支持快捷新增
- 样式与交互同现有"待办清单"模块保持一致
- 新增面包屑导航项"日记"

## Non-Goals (Out of Scope)
- **不**直接通过API写入"一本日记"App（该应用无公开API/开放接口）
- **不**实现真正的AI模型fine-tune训练（浏览器端无法实现），采用few-shot风格样本注入prompt方案
- **不**实现富文本编辑器（首期支持纯文本+Markdown）
- **不**实现图片/语音/视频等多媒体日记
- **不**实现日记分类标签/日记本分类（首期简化）
- **不**实现天气/位置自动获取

## Background & Context
- 现有项目为单文件HTML应用（`a-share-review-dashboard.html`），部署在Cloudflare Pages
- 已有完整的待办清单和纪念日模块，采用localStorage存储用户数据，登录后按用户隔离
- "一本日记"App调研结论：由杭州先丰网络开发（包名com.chenupt.day），支持WebDAV同步（坚果云/群晖NAS）、PDF/TXT导出、DayOne/卡片日记导入，**无公开API接口供外部写入**
- AI润色方案：前端调用大模型API（需用户配置API Key），用户历史作品作为风格样本存入localStorage，润色时作为system prompt中的few-shot examples
- 同步到一本日记的可行路径：
  1. 一键复制Markdown文本到剪贴板 → 用户在一本日记中粘贴
  2. 下载TXT/Markdown文件 → 用户通过一本日记的导入功能导入
  3. 后续可探索WebDAV直接写入（需研究一本日记的WebDAV数据格式）

## Functional Requirements
- **FR-1**: 日记数据存储 — 以用户为单位在localStorage中存储日记条目，每条包含：id、日期、原始内容、AI润色内容、创建时间、更新时间、心情标签（可选）
- **FR-2**: 首页卡片 — 在首页"纪念日"卡片之后新增"三省"日记卡片，展示近6条日记概要（日期+前30字预览），包含快捷输入框和"查看详情"按钮
- **FR-3**: 日记详情页 — 完整的日记列表页，按日期倒序展示所有日记，支持新增/编辑/删除日记
- **FR-4**: AI润色功能 — 用户录入原始内容后，点击"AI润色"按钮调用LLM API进行文本完善，展示loading状态，完成后同时展示原文和润色后的文本
- **FR-5**: 风格学习 — 提供"我的文风"设置区域，用户可粘贴3-10篇历史作品作为风格样本，润色时注入prompt让AI模仿该风格
- **FR-6**: AI配置面板 — 用户可配置LLM API的Base URL、API Key、模型名称（支持OpenAI兼容格式）
- **FR-7**: 原文/润色文对比展示 — 详情页新增/编辑日记时，左右或上下对比展示原文与AI润色文，用户可一键采纳润色文或继续编辑原文重新润色
- **FR-8**: 同步到一本日记 — 提供"复制内容"按钮（复制Markdown格式文本）和"下载TXT"按钮（下载为.txt文件）
- **FR-9**: 面包屑导航 — 在`BREADCRUMB_SECTIONS`中新增"日记"项
- **FR-10**: 路由支持 — 新增`sanxingDetail`页面key和`goSanxing()`导航函数

## Non-Functional Requirements
- **NFR-1**: 样式与现有待办清单模块保持一致（卡片风格、按钮样式、颜色主题兼容深色/亮色模式）
- **NFR-2**: AI API调用错误时有友好的错误提示（API Key未配置、网络错误、额度不足等）
- **NFR-3**: 日记数据按登录用户隔离（同待办清单的`diary_${currentUser}`存储key）
- **NFR-4**: 页面加载性能不受影响，日记数据懒加载渲染
- **NFR-5**: 响应式布局，移动端正常显示和操作
- **NFR-6**: 未登录用户不显示日记卡片（同待办清单逻辑）

## Constraints
- **Technical**: 单文件HTML架构，所有CSS/JS/HTML在同一文件中；数据存储使用localStorage；AI调用为前端直接fetch到LLM API（存在跨域问题需用户配置或使用支持CORS的代理）
- **Business**: 不硬编码任何API Key；AI功能是可选增强，无API Key时提示配置但不影响基本日记录入功能
- **Dependencies**: 外部LLM API（OpenAI兼容格式，如OpenAI、DeepSeek、通义千问、智谱等）

## Assumptions
- 用户会自行配置LLM API Key（首期支持OpenAI兼容接口格式）
- "复制到剪贴板"是同步到一本日记最便捷的路径（用户在手机上使用时，浏览器复制后切到一本日记App粘贴即可）
- 风格学习通过few-shot prompt实现（用户提供3-10篇历史文本作为风格样本），不需要真正的模型训练
- 日记功能对所有登录用户可见，不像纪念日有用户级隐藏逻辑

## Acceptance Criteria

### AC-1: 首页日记卡片展示
- **Given**: 用户已登录，且在首页
- **When**: 页面渲染完成
- **Then**: 在纪念日卡片之后显示"三省吾身"日记卡片，卡片顶部有📝标题，下方有快捷输入框+添加按钮，列表区域展示最近6条日记（日期+内容前30字），底部有"查看全部 (N) →"按钮
- **Verification**: `human-judgment`

### AC-2: 快捷新增日记
- **Given**: 用户在首页日记卡片
- **When**: 在输入框输入内容后回车或点击"添加"按钮
- **Then**: 日记条目被保存到localStorage，输入框清空，列表即时更新显示新条目
- **Verification**: `programmatic` (验证localStorage中有新条目，DOM更新)

### AC-3: AI润色功能
- **Given**: 用户在日记详情页打开了一条日记，且已配置API Key
- **When**: 点击"AI润色"按钮
- **Then**: 按钮显示loading状态，API调用完成后在原文旁边显示AI润色后的文本内容；若未配置API Key则弹出配置提示
- **Verification**: `programmatic` (mock API测试) + `human-judgment`

### AC-4: 原文润色文对比展示
- **Given**: 有一条已完成AI润色的日记
- **When**: 打开日记详情
- **Then**: 页面清晰区分展示"原始内容"和"AI润色"两个区域，两者均可见且可编辑
- **Verification**: `human-judgment`

### AC-5: 风格样本设置
- **Given**: 用户进入"我的文风"设置区域
- **When**: 粘贴历史作品文本并保存
- **Then**: 文本保存到localStorage，后续AI润色时该文本作为风格参考注入prompt
- **Verification**: `programmatic`

### AC-6: 复制同步功能
- **Given**: 一条日记已有AI润色内容
- **When**: 点击"复制内容"按钮
- **Then**: 格式化的Markdown日记内容（包含日期、原文、润色文）被复制到剪贴板，并显示toast提示"已复制，打开一本日记粘贴即可"
- **Verification**: `programmatic` (navigator.clipboard验证)

### AC-7: 面包屑导航
- **Given**: 任意页面
- **When**: 查看面包屑导航
- **Then**: "日记"出现在面包屑中，位于"待办清单"之后、"纪念日"之前（或按设计顺序）
- **Verification**: `human-judgment`

### AC-8: 未配置AI时的降级
- **Given**: 用户未配置API Key
- **When**: 使用日记功能
- **Then**: 基本的录入/查看/删除功能正常可用；点击"AI润色"时提示配置API Key，不阻断其他功能
- **Verification**: `programmatic` + `human-judgment`

### AC-9: 样式一致性
- **Given**: 日记卡片和详情页
- **When**: 与待办清单模块对比
- **Then**: 卡片样式、按钮样式、字体大小、间距、颜色与待办清单保持一致，深色/亮色主题均正常
- **Verification**: `human-judgment`

## Open Questions
- [ ] AI API调用是否需要配置CORS代理？（浏览器直接调用OpenAI等API通常有CORS限制，可能需要用户自备代理或使用支持CORS的API服务商如DeepSeek）
- [ ] 用户是否需要心情标签（😀😐😔等）辅助记录？还是首期不做？
- [ ] 历史日记的风格样本需要提供多少篇？建议3-10篇，是否需要对字数做限制？
- [ ] 同步到一本日记的WebDAV方案是否需要首期实现？还是先只做复制+下载？
