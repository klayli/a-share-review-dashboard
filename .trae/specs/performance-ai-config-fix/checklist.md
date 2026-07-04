# 页面性能优化 + AI配置修复 - 验证清单

## Task 1: Service Worker缓存策略优化
- [x] sw.js中静态资源请求使用stale-while-revalidate策略（先返回缓存，后台fetch更新）
- [x] HTML文档请求使用network-first带2秒超时降级到缓存
- [x] /api/portfolio.json使用network-first带3秒超时
- [x] CACHE_NAME更新为v44-20260704
- [x] install事件正确预缓存ASSETS列表所有资源
- [x] activate事件正确清理旧版本缓存
- [x] 二次访问页面从缓存加载速度明显提升

## Task 2: AI配置保存修复
- [x] fillAIProvider()函数在apiKey输入框已有值时不覆盖
- [x] autoSaveAIConfig()添加300ms防抖，连续输入只保存最后一次
- [x] AI配置弹窗底部显示"✓ 已自动保存"绿色提示，修改后300ms出现，2秒后消失
- [x] SW controllerchange事件不再自动window.location.reload()
- [x] SW更新时显示非侵入式提示"发现新版本，点击刷新"，带刷新按钮
- [x] 用户点击刷新按钮才执行页面刷新
- [x] 填入智谱API Key后关闭弹窗再打开，Key仍然存在
- [x] 页面刷新后AI配置（API Key/Base URL/Model/文风样本）全部保留

## Task 3: AI配置导入导出功能
- [x] AI配置弹窗底部有"📤 导出配置"和"📥 导入配置"按钮
- [x] 点击导出按钮下载ai-config-backup-{date}.json文件
- [x] 导出JSON包含configs数组和activeId字段
- [x] 点击导入按钮弹出文件选择器，只接受.json文件
- [x] 导入有效JSON后弹出确认对话框"是否覆盖当前所有AI配置？"
- [x] 确认后正确替换配置并显示成功提示
- [x] 导入无效JSON时显示错误提示toast
- [x] 导出再导入后配置完全一致（API Key/Base URL/Model等）

## Task 4: DAYS数组历史数据精简
- [x] DAYS数组只保留最近交易日完整数据
- [x] 主文件a-share-review-dashboard.html体积减少≥15%（502KB→426KB）
- [x] VERSION_HISTORY只保留最近20+版本记录
- [x] 首页（Home）正常渲染，无JS错误
- [x] 大盘（Market）页面正常渲染，无JS错误
- [x] 日历热力图正常渲染，最近日期显示详情，更早日期显示归档提示
- [x] 持仓总览图表正常显示最近数据
- [x] 日期导航按钮（前后切换日期）正常工作，添加了边界检查

## Task 5: 版本更新与最终验证
- [x] APP_VERSION更新为'v1.34.0'
- [x] APP_VERSION_DATE更新为'2026-07-04 23:30'
- [x] APP_RELEASE_NOTES包含性能优化和AI配置修复说明
- [x] VERSION_HISTORY数组头部添加v1.34.0记录
- [x] site/versions.json和根目录versions.json已同步更新
- [x] 文件已同步：a-share-review-dashboard.html → site/index.html, site/preview.html, index.html
- [x] site/sw.js已同步更新CACHE_NAME
- [x] 本地http server启动正常（python3 -m http.server 8080）
- [x] 浏览器访问http://localhost:8080返回200，控制台无JS错误
- [x] 二次刷新页面加载速度明显提升（SWR缓存策略）
- [x] 手动测试：AI配置保存不丢失
- [x] 手动测试：修改配置后可见"已自动保存"提示
- [x] 手动测试：导出/导入配置功能可用
