# 页面性能优化 + 三省API配置持久化修复 - PRD

## Overview
- **Summary**: 优化A股复盘看板线上页面加载速度，修复三省日记模块智谱AI等API配置在版本更新后丢失的问题。
- **Purpose**: 
  1. 当前单文件502KB，SW使用network-first策略导致每次加载都需网络请求，首屏慢；
  2. 智谱AI配置后保存逻辑存在竞态问题，加上SW自动更新强制刷新页面，导致用户配置的API Key丢失。
- **Target Users**: 使用本看板进行A股复盘、使用三省日记AI润色功能的用户。

## Goals
- 将首屏加载时间从当前>3s优化到<1.5s（3G网络），WiFi环境<500ms
- 修复AI API配置保存问题：配置智谱等AI后，无论页面刷新、版本更新、SW更新，配置都不会丢失
- 添加保存成功的明确视觉反馈

## Non-Goals (Out of Scope)
- 不进行后端API开发（纯前端+localStorage+SW方案）
- 不拆分单文件为多文件（保持部署简单性）
- 不修改Cloudflare Pages配置
- 不添加用户数据云端同步功能

## Background & Context
- 项目是单文件HTML应用（502KB），所有CSS/JS/数据内联
- 使用Service Worker做PWA缓存，但fetch策略是network-first（先网络后缓存），导致首屏始终依赖网络
- HTML体积主要来源：DAYS历史数据(~150KB)、LUNAR_INFO农历表(~5KB)、VERSION_HISTORY(~15KB)、JS逻辑(~200KB)、CSS(~55KB)
- 三省AI配置使用localStorage存储（key: `ai_configs_{username}`），所有输入框oninput触发autoSave
- v1.33.0添加了SW自动更新检测（controllerchange→reload），会在新版本SW激活时强制刷新页面，可能打断用户正在编辑AI配置

## Functional Requirements
- **FR-1: SW缓存策略优化**：将fetch策略从network-first改为stale-while-revalidate（先返回缓存，后台更新缓存），HTML文件使用network-first但带快速超时降级
- **FR-2: 关键资源预加载**：使用`<link rel="preload">`预加载关键资源
- **FR-3: HTML精简**：DAYS数组只保留最近30个交易日的完整数据，更早的数据只保留索引信息，不占首屏体积
- **FR-4: AI配置保存强化**：
  - autoSaveAIConfig增加防抖（debounce 300ms），避免频繁写入
  - fillAIProvider时不覆盖已有的apiKey值
  - SW更新时不再无条件强制刷新页面，改为提示用户"有新版本，点击刷新"
  - 保存时显示toast提示"配置已保存"
- **FR-5: AI配置导入导出**：添加"导出配置"和"导入配置"按钮，支持JSON格式备份/恢复AI配置
- **FR-6: Service Worker立即接管**：安装后立即activate，claim所有clients

## Non-Functional Requirements
- **NFR-1: 首屏加载速度**：stale-while-revalidate命中缓存时，首屏可交互时间<500ms
- **NFR-2: 配置持久化**：AI配置写入localStorage后，除非用户主动清除或重置，100%不丢失
- **NFR-3: 向后兼容**：优化后不破坏现有localStorage中的所有用户数据
- **NFR-4: 文件体积**：优化后主文件（a-share-review-dashboard.html）体积减少15%以上

## Constraints
- **Technical**: 纯前端单HTML文件，不能引入后端；必须兼容现有localStorage数据结构；Cloudflare Pages静态托管
- **Business**: 保持现有功能完整，不能因为优化导致任何功能缺失
- **Dependencies**: 东方财富/新浪/腾讯/天天基金等外部API依赖不变

## Assumptions
- 用户浏览器支持Service Worker和localStorage（现代浏览器均支持）
- SW缓存清除不影响localStorage（浏览器API层面保证）
- Cloudflare Pages CDN已开启gzip/brotli压缩（平台默认行为）
- 用户配置丢失的根本原因是：SW controllerchange强制刷新打断了正在输入的API Key，加上fillAIProvider中autoSave可能用空值覆盖

## Acceptance Criteria

### AC-1: SW stale-while-revalidate缓存策略
- **Given**: 用户首次访问并完成SW注册
- **When**: 用户第二次及以后访问页面
- **Then**: 页面立即从缓存加载（<500ms可交互），同时后台静默更新缓存
- **Verification**: `programmatic`
- **Notes**: 验证SW的fetch事件处理逻辑改为SWR

### AC-2: 历史DAYS数据精简
- **Given**: 主文件中DAYS数组包含全部历史交易日数据
- **When**: 优化完成后
- **Then**: DAYS数组首屏只包含最近30个交易日完整数据，更早数据不内联在HTML中
- **Verification**: `programmatic`
- **Notes**: 历史数据可通过API按需加载或完全不影响功能（历史复盘仍可查看最近30天）

### AC-3: AI配置保存不丢失
- **Given**: 用户打开AI配置弹窗，选择智谱AI，填入API Key
- **When**: 用户填完API Key后点击完成，或等待1秒，或页面被刷新/版本更新
- **Then**: 再次打开页面和AI配置弹窗，之前填入的智谱API Key、Base URL、Model、文风样本全部存在
- **Verification**: `programmatic` + `human-judgment`

### AC-4: fillAIProvider不覆盖API Key
- **Given**: 用户已经在API Key输入框中填入了key
- **When**: 用户点击"一键填充"智谱/DeepSeek等按钮
- **Then**: 只填充Base URL和Model，不清空/覆盖API Key输入框中已有的值
- **Verification**: `programmatic`

### AC-5: SW更新时不强制打断用户
- **Given**: 新版本SW已在后台安装完成
- **When**: SW状态变为installed且有controller变化
- **Then**: 不自动刷新页面；显示一个非侵入式提示"发现新版本，点击刷新"，用户点击后才刷新
- **Verification**: `programmatic` + `human-judgment`

### AC-6: 保存成功反馈
- **Given**: 用户在AI配置弹窗中修改任何字段
- **When**: 修改后停止输入300ms
- **Then**: 弹窗底部显示"✓ 已自动保存"的轻量提示（绿色小字，2秒后消失）
- **Verification**: `human-judgment`

### AC-7: AI配置导入导出
- **Given**: 用户已配置好AI
- **When**: 用户点击"导出配置"按钮
- **Then**: 下载一个JSON文件包含所有AI配置（API Key做脱敏显示选项）；点击"导入配置"可从JSON文件恢复
- **Verification**: `programmatic` + `human-judgment`

### AC-8: 版本号更新
- **Given**: 所有优化完成
- **When**: 发布新版本
- **Then**: APP_VERSION更新为v1.34.0，版本历史添加对应记录
- **Verification**: `programmatic`

## Open Questions
- [ ] DAYS数组精简到最近30天是否可接受？用户是否需要查看30天前的交易日详情？（默认保留30天，更早的交易日详情显示"数据已归档，请查看历史版本"）
- [ ] AI配置导出时是否需要密码加密？（默认不加密，JSON明文存储，用户自行保管）
