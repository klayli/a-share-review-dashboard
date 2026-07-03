# 三省日记功能增强 - 产品需求文档（PRD）

## Overview
- **Summary**: 对已实现的"三省"日记功能进行三项增强：1）AI配置面板预置免费API服务商推荐和快速选择，引导用户获取免费API Key；2）原始内容区域也支持独立的复制和下载功能；3）AI润色内容区域改为可编辑文本，用户可直接修改润色结果。
- **Purpose**: 降低AI润色功能的使用门槛（用户无需自己摸索API配置），让原文和润色文都支持独立导出操作，同时让用户可以直接编辑AI生成的润色内容。
- **Target Users**: 已使用三省日记功能的用户，希望零配置/低门槛使用AI润色，需要灵活复制下载原文/润色文。

## Goals
- AI配置面板提供预置免费API服务商快速选择（DeepSeek、智谱AI、硅基流动等）
- 提供获取免费API Key的清晰引导和链接
- 原始内容区域添加"复制原文"和"下载原文"按钮
- AI润色内容改为可编辑textarea，支持直接修改
- 复制/下载功能区分：原文区操作原文，润色区操作润色文

## Non-Goals (Out of Scope)
- 不提供内置/硬编码的永久有效API Key（安全和成本原因）
- 不实现后端代理服务
- 不实现WebDAV自动同步（仍需用户手动复制/导入）

## Functional Requirements
- **FR-1**: AI配置弹窗增加"推荐服务商"区域，列出3-4个有免费额度的AI服务商，每个带"一键填充"按钮和获取API Key的链接
- **FR-2**: 默认Base URL预置为`https://api.deepseek.com/v1`，Model预置为`deepseek-chat`
- **FR-3**: 原文区域（✏️）底部添加操作按钮：📋 复制原文、📥 下载原文
- **FR-4**: 润色区域（✨）的内容展示从只读div改为可编辑textarea
- **FR-5**: 复制/下载按钮明确区分：复制原文/下载原文（仅原文内容）、复制润色/下载润色（仅润色内容）、保留"复制全部"按钮导出完整Markdown
- **FR-6**: 润色内容编辑后自动保存（失焦或Ctrl+S触发updateDiary）

## Non-Functional Requirements
- **NFR-1**: 配置引导清晰简洁，不增加用户认知负担
- **NFR-2**: 可编辑textarea高度自适应内容
- **NFR-3**: 所有操作按钮保持与现有btn-small样式一致

## Constraints
- **Technical**: 单文件HTML，无后端服务，浏览器端直接调用AI API（需CORS支持）
- **Business**: 不硬编码任何真实API Key，只预置服务商配置模板

## Assumptions
- 用户愿意花1-2分钟注册免费API账号（DeepSeek/智谱等均提供免费额度，手机号注册即可）
- 可编辑textarea的自动保存不会造成性能问题

## Acceptance Criteria

### AC-1: AI配置预置推荐
- **Given**: 用户打开AI设置弹窗
- **When**: 查看配置面板
- **Then**: 弹窗中有"推荐免费服务商"区域，至少列出DeepSeek、智谱AI/GLM、硅基流动三个选项，每个带一键填充按钮和注册链接
- **Verification**: `human-judgment`

### AC-2: 原文独立复制下载
- **Given**: 任意日记条目
- **When**: 查看原文区域
- **Then**: 原文区域底部有"📋 复制原文"和"📥 下载原文"按钮，点击可分别复制/下载仅原文内容
- **Verification**: `programmatic` + `human-judgment`

### AC-3: 润色文可编辑
- **Given**: 有润色内容的日记
- **When**: 点击润色区域的文本
- **Then**: 文本区域可直接编辑修改；修改后失焦自动保存到localStorage
- **Verification**: `human-judgment`

### AC-4: 默认配置
- **Given**: 首次打开AI设置
- **When**: 未做任何配置
- **Then**: Base URL已预填DeepSeek地址，Model已预填deepseek-chat，API Key为空，提示用户填入
- **Verification**: `programmatic`

## Open Questions
- 无
