# v1.36.0 综合修复与增强 - 产品需求文档

## Overview
- **Summary**: 本次迭代包含6项修复与增强：(1)早报数据缺失修复；(2)headerCustomInput云端存储修复；(3)日期选择器倒序；(4)待办输入框浏览器密码提示修复；(5)全量数据云端存储方案落地；(6)股票K线图ECharts替换。
- **Purpose**: 修复v1.36.0版本中已声明但未完整实现的功能，确保云端存储真正可用，提升K线图交互体验。
- **Target Users**: 个人投资者（admin账号为主）

## Goals
- 修复今日（2026-07-06）早报数据缺失问题，补充7/3和7/6早报数据
- 修复headerCustomInput云端存储不生效问题（根因：Cloudflare KV命名空间未绑定）
- 日期选择器selectDate倒序排列（最新日期在最前）——验证已有实现
- 修复待办清单输入时浏览器提示保存密码问题（根因：render()周期性重建DOM导致input被视为新表单）
- 全量数据云端存储方案落地：配置Cloudflare KV命名空间绑定，确保所有个人数据保存到云端
- 股票弹窗K线图用ECharts实现，支持MA均线、周期切换、交互缩放

## Non-Goals (Out of Scope)
- 不做早报自动生成（仍是手动维护数据）
- 不修改云端存储架构（保持Cloudflare Pages Functions + KV方案）
- 不做用户注册系统
- 不做实时K线推送（WebSocket）

## Background & Context
- 项目是单文件HTML应用（`a-share-review-dashboard.html`），部署在Cloudflare Pages
- 当前版本v1.36.0，release notes已声明了所有6项功能，但实际代码存在以下问题：
  - 早报数据仅到2026-07-03，缺少2026-07-06（周一）数据
  - Cloudflare KV命名空间从未在wrangler.toml中绑定，导致`/api/user/data`端点中`env.USER_DATA`始终为null，云端存储实际未生效
  - 日期选择器已倒序排列（代码正确）
  - 待办输入框已添加autocomplete="off"，但render()周期性调用导致DOM重建
  - K线图仍使用新浪GIF静态图片，无交互能力
- 已有Cloudflare Pages Function `/api/user/data`（GET/POST），代码完整但缺少KV绑定
- 东方财富API提供K线数据：`https://push2his.eastmoney.com/api/qt/stock/kline/get`

## Functional Requirements

### FR-1: 早报数据补充
- 补充2026-07-03（周五）和2026-07-06（周一）的早报数据到MORNING_REPORTS对象
- 2026-07-03：周五交易日，覆盖美股/港股/A股/外汇/商品/加密货币
- 2026-07-06：周一交易日，覆盖隔夜外盘+当日前瞻

### FR-2: headerCustomInput云端存储修复
- 在wrangler.toml中配置Cloudflare KV命名空间绑定（绑定名：USER_DATA）
- 验证saveHeaderCustom → scheduleCloudSync → saveToCloud → /api/user/data 链路完整
- 验证loadFromCloud → localStorage回写 → loadHeaderCustom 链路完整
- 确保登录后自动从云端加载headerCustom数据

### FR-3: 日期选择器倒序
- 验证renderDateButtons()中select元素已按日期倒序排列（最新在前）
- 早报详情页的日期选择器同步倒序

### FR-4: 待办输入框密码提示修复
- 根因分析：render()周期性调用（每60秒checkRefresh）导致DOM重建，input元素被重新创建，浏览器识别为"新表单"
- 修复方案：将todoInput的渲染从render()中分离，不在render()中重建input元素；或使用防抖/条件判断避免不必要的DOM重建
- 确保所有input元素（包括headerCustomInput、todoInput、日记输入框等）不被周期性render()重建

### FR-5: 全量数据云端存储落地
- 在Cloudflare控制台创建KV命名空间，绑定到Pages项目
- 更新wrangler.toml添加KV绑定配置
- 验证以下数据类型均已云端同步：
  - 待办清单（todos_${user}）
  - 纪念日（anni_${user}）
  - 三省日记（diary_${user}）
  - 顶部自定义内容（headerCustom_${user}）
  - AI配置（ai_configs_${user}、ai_active_config_${user}）
- 登录时自动加载云端数据，修改后2秒自动同步

### FR-6: ECharts K线图
- 引入ECharts CDN库（echarts@5）
- 调用东方财富K线API获取历史数据：`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=0&end=20500101&lmt=120`
- 实现K线图（蜡烛图）+ MA均线（MA5、MA10、MA30）
- 支持周期切换：日K（默认）、周K、月K
- 支持交互：缩放、拖拽、十字光标
- 替换现有新浪GIF图片方案
- 保留现有的"在东方财富查看详情"链接

## Non-Functional Requirements
- **NFR-1**: ECharts从CDN加载，不打包到HTML中（减少文件体积）
- **NFR-2**: K线API请求失败时降级显示提示信息
- **NFR-3**: 云端存储同步失败时不影响本地使用（静默降级）
- **NFR-4**: 保持移动端响应式布局
- **NFR-5**: 早报数据格式与现有MORNING_REPORTS结构一致

## Constraints
- **Technical**: 单文件HTML架构，Cloudflare Pages部署，ECharts CDN引入
- **Business**: Cloudflare免费额度内运行，东方财富免费API
- **Dependencies**: Cloudflare KV（需创建并绑定命名空间）、ECharts CDN、东方财富K线API

## Assumptions
- Cloudflare账号有权限创建KV命名空间
- 东方财富K线API在浏览器端可直接调用（无跨域限制）
- 用户已有Cloudflare账号登录权限
- ECharts CDN可正常访问

## Acceptance Criteria

### AC-1: 早报数据更新
- **Given**: 用户选择2026-07-06日期
- **When**: 查看早报详情
- **Then**: 显示2026-07-06周一的完整早报数据（含核心关注、隔夜外盘、要闻精选等模块）
- **Verification**: `human-judgment`

### AC-2: headerCustom云端存储
- **Given**: 用户已登录，在顶部输入框输入文字并失焦
- **When**: 刷新页面或另一设备登录
- **Then**: 顶部自定义内容从云端加载并显示，跨设备一致
- **Verification**: `programmatic`

### AC-3: 日期选择器倒序
- **Given**: 页面渲染日期选择器
- **When**: 查看select下拉列表
- **Then**: 日期按从新到旧排列（最新日期在最前面）
- **Verification**: `human-judgment`

### AC-4: 待办输入框无密码提示
- **Given**: 用户在待办清单输入框中输入文字
- **When**: 页面自动刷新（render()调用）后
- **Then**: 浏览器不弹出"保存密码"提示
- **Verification**: `human-judgment`

### AC-5: 云端存储全量数据
- **Given**: 用户已登录，添加了待办/纪念日/日记/顶部自定义内容
- **When**: 清除浏览器localStorage后刷新页面
- **Then**: 所有数据从云端恢复，与清除前一致
- **Verification**: `programmatic`

### AC-6: ECharts K线图展示
- **Given**: 用户点击持仓股票名称
- **When**: 弹窗打开
- **Then**: 显示ECharts渲染的K线图（蜡烛图），包含MA5/MA10/MA30均线，支持周期切换（日K/周K/月K），支持缩放拖拽交互
- **Verification**: `human-judgment`

### AC-7: K线图降级
- **Given**: 东方财富K线API请求失败
- **When**: 弹窗打开
- **Then**: 显示友好提示"K线数据加载失败，请稍后重试"，不显示空白或报错
- **Verification**: `programmatic`

## Open Questions
- [ ] Cloudflare KV命名空间是否已创建？需要用户提供或由开发者在Cloudflare控制台创建
- [ ] K线图是否需要支持分时图（日内）？当前方案仅支持日K/周K/月K