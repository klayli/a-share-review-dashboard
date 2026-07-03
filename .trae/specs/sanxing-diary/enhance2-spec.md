# 三省日记功能增强（多AI配置/批量删除/精确时间/内容检索）- PRD

## Overview
- **Summary**: 对三省日记功能进行四项增强：1）AI配置从单套改为多套配置管理，支持保存多个AI渠道配置并快速切换，每个配置有自定义名称；2）详情页编辑区右侧显示当前使用的AI名称；3）支持复选框批量删除日记；4）日记时间戳精确到年月日时分；5）支持日记内容关键词检索搜索。
- **Purpose**: 用户可能有多个AI API Key，需要快速切换；批量删除方便清理；精确时间更符合日记习惯；检索功能方便快速查找过往日记内容。
- **Target Users**: 使用三省日记功能、拥有多个AI API Key、需要查找历史日记的用户。

## Goals
- AI配置支持多套保存（每套包含：AI名称、Base URL、API Key、Model、文风样本）
- AI设置弹窗可管理多套配置（新增/删除/切换）
- 详情页编辑区"保存日记"按钮右侧显示当前AI名称
- 日记列表支持复选框多选+批量删除按钮
- 日记时间记录精确到时分（YYYY-MM-DD HH:mm格式），列表显示时分
- 日记内容支持关键词检索，支持原文和润色文搜索，高亮匹配关键词
- 首页卡片也显示时间

## Non-Goals (Out of Scope)
- 不实现AI配置的导入/导出
- 不实现不同日记使用不同AI润色的历史追溯
- 不修改数据存储的加密方式
- 不实现全文检索引擎（使用简单的字符串包含匹配即可）

## Functional Requirements
- **FR-1**: 数据结构重构：AI配置从单个对象改为数组`aiConfigs[]`，每个元素包含`{id, name, baseUrl, apiKey, model, styleSample}`；另存`activeAIConfigId`标记当前选中
- **FR-2**: AI设置弹窗UI重构：顶部显示已保存的AI配置标签页，可点击切换；当前选中高亮；支持"新增配置"和"删除当前配置"
- **FR-3**: 每个配置可设置自定义"AI名称"
- **FR-4**: 切换配置时表单自动填充对应配置内容，编辑自动保存
- **FR-5**: 详情页编辑区右侧显示当前AI名称
- **FR-6**: 日记列表每篇日记前加复选框，顶部加"全选"和"批量删除"按钮
- **FR-7**: 批量删除有确认提示
- **FR-8**: 日记date字段改为YYYY-MM-DD HH:mm格式
- **FR-9**: 列表和首页显示精确时间
- **FR-10**: 旧数据平滑迁移
- **FR-11**: 日记检索功能：详情页顶部添加搜索输入框，输入关键词实时过滤日记列表，搜索范围包含原文和AI润色内容；匹配的关键词在结果中高亮显示（黄色背景）
- **FR-12**: 搜索框支持清空，空搜索词时显示全部日记；显示搜索结果数量（如"找到 X 篇匹配日记"）

## Non-Functional Requirements
- **NFR-1**: 旧数据平滑迁移，不丢失数据
- **NFR-2**: 多配置切换流畅不刷新
- **NFR-3**: 批量删除有二次确认
- **NFR-4**: 搜索响应即时（输入即过滤，无需点击按钮），对数百篇日记无性能问题

## Constraints
- **Technical**: 单文件HTML，localStorage存储，无后端；搜索使用前端字符串匹配
- **Dependencies**: 复用现有AI_PROVIDERS预设

## Assumptions
- 用户配置数量通常2-5个
- 日记数量预计在数百篇以内，前端过滤足够
- 精确时间只精确到分钟
- 搜索为简单子串匹配（不支持正则/模糊匹配）

## Acceptance Criteria

### AC-1: 多AI配置保存切换
- **Given**: 用户打开AI设置弹窗
- **When**: 配置了多套AI并分别保存
- **Then**: 弹窗顶部可见所有配置名称标签，点击切换表单内容；当前选中高亮
- **Verification**: `human-judgment`

### AC-2: AI名称显示
- **Given**: 用户选中了某个AI配置
- **When**: 返回详情页
- **Then**: "保存日记"按钮右侧显示当前AI名称
- **Verification**: `human-judgment`

### AC-3: 批量删除
- **Given**: 详情页有若干日记
- **When**: 勾选多个日记点"批量删除"并确认
- **Then**: 被勾选日记被删除，列表和统计更新
- **Verification**: `programmatic` + `human-judgment`

### AC-4: 精确时间
- **Given**: 新增一篇日记
- **When**: 保存成功
- **Then**: 日记时间包含时分，按精确时间排序
- **Verification**: `programmatic` + `human-judgment`

### AC-5: 旧数据兼容
- **Given**: localStorage中有旧格式数据
- **When**: 刷新页面
- **Then**: 旧AI配置迁移为"默认配置"；旧日记日期不丢失
- **Verification**: `programmatic`

### AC-6: 日记内容检索
- **Given**: 详情页有多篇日记
- **When**: 在搜索框输入关键词
- **Then**: 列表实时过滤为包含关键词的日记（原文或润色文匹配），匹配关键词高亮显示；显示匹配数量；清空搜索词恢复全部列表
- **Verification**: `human-judgment` + `programmatic`

### AC-7: 新增/删除配置
- **Given**: AI设置弹窗中
- **When**: 新增/删除配置
- **Then**: 新配置自动选中；删除后切换到其他配置（至少保留1个）
- **Verification**: `human-judgment`

## Open Questions
- 无
