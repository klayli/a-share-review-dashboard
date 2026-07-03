# 三省日记功能增强（多AI配置/批量删除/精确时间）- PRD

## Overview
- **Summary**: 对三省日记功能进行三项增强：1）AI配置从单套改为多套配置管理，支持保存多个AI渠道配置并快速切换，每个配置有自定义名称；2）详情页编辑区右下角显示当前使用的AI名称；3）支持复选框批量删除日记；4）日记时间戳精确到年月日时分。
- **Purpose**: 用户可能有多个AI API Key（如DeepSeek+智谱+硅基流动），需要快速切换而不重复输入；批量删除方便清理；精确时间更符合日记记录习惯。
- **Target Users**: 使用三省日记功能、拥有多个AI API Key的用户。

## Goals
- AI配置支持多套保存（每套包含：AI名称、Base URL、API Key、Model、文风样本）
- AI设置弹窗可管理多套配置（新增/删除/切换）
- 详情页编辑区"保存日记"按钮右侧显示当前AI名称
- 日记列表支持复选框多选+批量删除按钮
- 日记时间记录精确到时分（YYYY-MM-DD HH:mm格式），列表显示时分
- 首页卡片也显示时间

## Non-Goals (Out of Scope)
- 不实现AI配置的导入/导出
- 不实现不同日记使用不同AI润色的历史追溯（润色时用当前选中的AI即可）
- 不修改数据存储的加密方式

## Functional Requirements
- **FR-1**: 数据结构重构：AI配置从单个对象改为数组`aiConfigs[]`，每个元素包含`{id, name, baseUrl, apiKey, model, styleSample}`；另存`activeAIConfigId`标记当前选中
- **FR-2**: AI设置弹窗UI重构：顶部显示已保存的AI配置标签页/下拉列表，可点击切换；当前选中高亮；支持"新增配置"和"删除当前配置"
- **FR-3**: 每个配置可设置自定义"AI名称"（如"我的DeepSeek"、"智谱免费版"）
- **FR-4**: 切换配置时表单自动填充对应配置内容，修改表单字段后自动保存到当前配置（或点保存按钮保存）
- **FR-5**: 详情页`.diary-add-actions`区域右侧显示当前AI名称，如"🤖 当前：智谱AI (GLM)"
- **FR-6**: 日记列表每篇日记前加复选框，顶部加"全选"复选框和"🗑️ 批量删除"按钮
- **FR-7**: 批量删除有确认提示，删除后刷新列表
- **FR-8**: 日记`date`字段改为`YYYY-MM-DD HH:mm`格式（如"2026-07-03 20:50"），新增日记时自动填充当前日期+时间；日期选择器保留（仅日期部分），时间用当前时分
- **FR-9**: 日记列表中显示精确时间，首页卡片摘要也显示时分
- **FR-10**: 兼容旧数据：旧日记date字段只有日期的，时分显示为00:00或原始createdAt时间

## Non-Functional Requirements
- **NFR-1**: 旧数据（单AI配置、旧日期格式）需平滑迁移，不丢失数据
- **NFR-2**: 多配置切换操作流畅，不刷新页面
- **NFR-3**: 批量删除操作有明确的二次确认，防止误删

## Constraints
- **Technical**: 单文件HTML，localStorage存储，无后端
- **Dependencies**: 复用现有AI_PROVIDERS预设作为新配置的快捷模板

## Assumptions
- 用户配置数量通常在2-5个之间，不需要分页或搜索
- 精确时间只精确到分钟即可，不需要秒

## Acceptance Criteria

### AC-1: 多AI配置保存切换
- **Given**: 用户打开AI设置弹窗
- **When**: 配置了多套AI（如DeepSeek、智谱、硅基流动）并分别保存
- **Then**: 弹窗顶部可见所有已保存配置的名称标签，点击标签立即切换表单内容；当前选中的配置高亮显示
- **Verification**: `human-judgment`

### AC-2: AI名称显示
- **Given**: 用户选中了某个AI配置
- **When**: 返回详情页
- **Then**: "保存日记"按钮右侧显示"🤖 当前：XXX"（XXX为配置的AI名称）
- **Verification**: `human-judgment`

### AC-3: 批量删除
- **Given**: 详情页有若干日记
- **When**: 勾选多个日记的复选框，点击"批量删除"并确认
- **Then**: 被勾选的日记被删除，列表刷新，统计数字更新
- **Verification**: `programmatic` + `human-judgment`

### AC-4: 精确时间
- **Given**: 新增一篇日记
- **When**: 保存成功
- **Then**: 日记显示的时间包含时分（如"📅 2026-07-03 20:50"），排序按精确时间
- **Verification**: `programmatic` + `human-judgment`

### AC-5: 旧数据兼容
- **Given**: localStorage中有旧格式的AI配置和日记数据
- **When**: 用户刷新页面
- **Then**: 旧AI配置自动迁移为第一个配置项（名称为"默认配置"）；旧日记日期不丢失，补充分钟信息
- **Verification**: `programmatic`

### AC-6: 新增/删除配置
- **Given**: AI设置弹窗中
- **When**: 点击"新增配置"并填写信息保存
- **Then**: 新配置出现在配置列表中并自动选中；点击"删除配置"可删除当前选中配置（至少保留1个）
- **Verification**: `human-judgment`

## Open Questions
- 无
