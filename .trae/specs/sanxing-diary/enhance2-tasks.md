# 三省日记增强2 - 实现计划

## [ ] Task 1: 数据层重构 - 多AI配置+精确时间+数据迁移
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 重构AI配置存储：从单个`ai_config_${user}`改为`ai_configs_${user}`（数组）+ `ai_active_config_${user}`（当前选中ID）
  - 配置项结构：`{id: timestamp, name: string, baseUrl: string, apiKey: string, model: string, styleSample: string}`
  - 添加数据迁移函数`migrateAIConfig()`：读取旧的单配置，迁移为数组中第一个配置（name:"默认配置"）
  - 修改getAIConfig()：返回当前激活配置，含name/id字段
  - 新增getAIConfigs()/saveAIConfigs()/setActiveAIConfig()/deleteAIConfig()/addAIConfig()
  - 修改saveAIConfig(config)：更新当前激活配置（保持向后兼容）
  - 修改getStyleSamples()/saveStyleSamples()：从当前激活配置读写
  - 新增nowDateTimeStr()函数返回YYYY-MM-DD HH:mm格式
  - 修改addDiaryFromHome(text, date)：date字段使用精确时间格式（传入YYYY-MM-DD时拼接当前HH:mm，否则用nowDateTimeStr()）
  - 添加旧日记迁移：遍历日记，若date长度<=10，用createdAt补充分钟
  - 新增全局变量`diarySearchKeyword = ''`存储当前搜索关键词
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-1.1: 旧单配置自动迁移为"默认配置"
  - `programmatic` TR-1.2: getAIConfig()返回当前激活配置字段完整（含name/id）
  - `programmatic` TR-1.3: 旧日记date字段自动补充时间
  - `programmatic` TR-1.4: 新日记date格式为"YYYY-MM-DD HH:mm"
  - `programmatic` TR-1.5: 多配置增删切换API功能正确

## [ ] Task 2: AI设置弹窗重构（多配置管理UI）
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 修改aiConfigModal弹窗HTML：
    - 顶部配置标签栏：横向排列配置名称按钮，当前选中高亮，右侧"+ 新增"和"🗑️ 删除"按钮
    - API Key字段前添加"AI名称"输入框（id="aiConfigName"）
  - 重写openAIConfig()：渲染标签栏+绑定切换/新增/删除事件+填充当前配置表单
  - switchAIConfig(id)：保存当前表单到当前配置，切换到目标配置，填充表单
  - 表单字段(name/baseUrl/apiKey/model/styleSamples)在input/change事件时自动保存到当前配置（防抖）
  - fillAIProvider(index)修改：填充后自动更新name为服务商名称
  - testAIConnection()：从当前表单读取
  - closeAIConfig()时保存当前表单到配置
  - saveAIConfigFromModal()：保存并关闭（与closeAIConfig一致，按钮可改为"完成"）
- **Acceptance Criteria Addressed**: AC-1, AC-7
- **Test Requirements**:
  - `human-judgement` TR-2.1: 标签栏显示所有配置，当前高亮
  - `human-judgement` TR-2.2: 点击标签切换表单
  - `human-judgement` TR-2.3: 新增/删除配置正常
  - `programmatic` TR-2.4: 编辑后切换再切回值不丢失
  - `human-judgement` TR-2.5: AI名称修改后标签栏同步更新

## [ ] Task 3: 详情页AI名称回显
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 修改renderSanxingDetail()中.diary-add-actions区域
  - 左侧：AI润色+保存日记按钮；右侧：当前AI名称显示
  - 右侧：`<span class="diary-current-ai" id="currentAIName">🤖 当前：${config.name || '未配置'}</span>`
  - .diary-add-actions改为flex justify-between align-center wrap gap:8px
  - 无有效API Key时显示"🤖 未配置AI"（可选加点击打开设置）
  - 配置切换后（关闭AI弹窗时/setActiveAIConfig时）更新currentAIName元素
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-3.1: 保存日记右侧显示AI名称
  - `human-judgement` TR-3.2: 切换配置后名称同步更新
  - `programmatic` TR-3.3: 未配置Key时显示"未配置"

## [ ] Task 4: 批量删除功能
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在日记列表顶部（diaryListDetail之前或统计行）添加批量操作栏：
    - `<div class="diary-batch-bar"><label><input type="checkbox" id="diarySelectAll" onchange="toggleAllDiaries(this.checked)"> 全选</label> <button class="btn-small btn-danger" onclick="batchDeleteDiaries()" id="batchDeleteBtn" disabled>🗑️ 批量删除</button> <span id="selectedCount"></span> <span id="searchResultInfo"></span></div>`
  - 每篇日记diary-header左侧添加复选框`<input type="checkbox" class="diary-checkbox" data-id="${d.id}" onchange="updateSelectedCount()">`
  - 实现toggleAllDiaries(checked)/updateSelectedCount()/batchDeleteDiaries()
  - 批量删除需confirm提示"确定删除选中的X篇日记吗？此操作不可恢复"
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 勾选后批量删除按钮可用
  - `programmatic` TR-4.2: 删除后日记从localStorage移除
  - `human-judgement` TR-4.3: 全选/取消正常
  - `human-judgement` TR-4.4: 有确认提示

## [ ] Task 5: 时间格式精确到时分
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 实现nowDateTimeStr()：用本地时区返回"YYYY-MM-DD HH:mm"
  - 修改addDiaryFromHome：date处理逻辑（YYYY-MM-DD → 拼接HH:mm）
  - 修改renderDiaryListDetail()：日期直接显示d.date
  - 修改renderDiaryListHome()：摘要显示"MM-DD HH:mm · 内容"或完整d.date
  - 修改download文件名：":"替换为"-"
  - editDiary()回填时dateInput.value取日期部分（d.date.substring(0,10)）
  - 排序：b.date.localeCompare(a.date) 对YYYY-MM-DD HH:mm格式字符串正确
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 新日记date含时分
  - `programmatic` TR-5.2: 下载文件名无":"
  - `human-judgement` TR-5.3: 列表日期显示正确
  - `human-judgement` TR-5.4: 编辑回填日期正确

## [ ] Task 6: 日记内容检索功能
- **Priority**: high
- **Depends On**: Task 4 (批量操作栏可以放搜索框)
- **Description**:
  - 在renderSanxingDetail()中，日记列表区域上方（批量操作栏内或单独一行）添加搜索框：
    - `<div class="diary-search-bar"><input type="text" id="diarySearchInput" placeholder="🔍 搜索日记内容（原文/润色文）..." oninput="onDiarySearch(this.value)" style="flex:1"></div>`
    - 可以和批量操作栏合并为一行，flex布局，搜索框占满剩余空间
  - 实现onDiarySearch(keyword)：设置diarySearchKeyword，调用renderDiaryListDetail()刷新列表
  - 修改renderDiaryListDetail()过滤逻辑：
    - 取所有日记，若diarySearchKeyword非空，过滤d.original包含keyword或d.polished包含keyword（大小写不敏感）
    - 添加highlightText(text, keyword)函数：将text中匹配keyword的部分用`<mark>`标签包裹（黄色背景），转义HTML后再高亮
    - 渲染时，原文和润色文本使用highlightText()处理后输出（注意textarea不能显示HTML高亮，所以搜索模式下：搜索结果列表中匹配的日记正常显示textarea但在textarea上方或旁边加标识；或者：无搜索时正常用textarea，搜索结果预览时用div展示高亮内容，点击可跳转编辑）
    - 简洁方案：搜索时textarea正常显示（不高亮），但在日记header日期旁边加一个"🔍匹配"标签标识；同时更新searchResultInfo显示"找到 X 篇匹配"
    - 进阶方案：使用div替代textarea显示带高亮的文本，点击div切换为textarea编辑（更复杂，建议先做简洁方案）
    - 最终方案：搜索结果列表中，原文和润色内容在textarea中显示，但diary-header或label旁显示匹配数量标识；另外在textarea上方加一个`<div class="search-hint">`提示"此日记匹配搜索关键词"；实际使用textarea无法高亮HTML，所以折中方案是：搜索时将textarea临时替换为带高亮的div展示，点击div任意位置切换回textarea编辑（失焦再切回div或保留textarea）。
    - 推荐最简方案：保持textarea显示，在每个日记条目的header处显示匹配来源（原文匹配/润色文匹配/都匹配），用小标签展示。并在搜索栏右侧显示结果数"找到 X 篇"。
  - 搜索框右侧添加清除按钮（X图标），点击清空搜索词
  - 搜索框支持ESC键清空
  - 批量删除/全选在搜索模式下只操作当前过滤出的日记
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 输入关键词后列表过滤为匹配日记
  - `programmatic` TR-6.2: 搜索原文和润色文都能命中
  - `human-judgement` TR-6.3: 显示匹配结果数量
  - `human-judgement` TR-6.4: 清空搜索词恢复全部
  - `programmatic` TR-6.5: 大小写不敏感匹配
  - `human-judgement` TR-6.6: 响应即时，无明显延迟

## [ ] Task 7: CSS样式与版本更新
- **Priority**: high
- **Depends On**: Task 2-6
- **Description**:
  - 添加CSS：
    - `.ai-config-tabs`/`.ai-config-tab`/`.ai-config-tab.active`/`.ai-config-tab-actions`：标签栏样式
    - `.diary-add-actions`：flex space-between align-center wrap gap:8px
    - `.diary-current-ai`：小字灰色显示
    - `.diary-batch-bar`：搜索+批量操作栏flex布局，gap:10px，padding，background
    - `.diary-batch-bar .btn-danger`样式disabled态
    - `.diary-search-bar`/`#diarySearchInput`：搜索框样式，flex:1，与现有输入框一致
    - `.diary-header`：flex align-center gap:8px
    - `.diary-checkbox`：accent-color:var(--yellow)
    - `.search-match-tag`：小标签样式，黄色背景，深色文字，font-size:.72rem，padding:1px 6px，border-radius:4px
    - `.diary-search-highlight`（如果实现高亮div）：黄色背景
  - 更新版本号v1.32.0，更新APP_VERSION_DATE/RELEASE_NOTES/VERSION_HISTORY
  - 更新versions.json
  - 同步文件到site/和index.html
- **Test Requirements**:
  - `programmatic` TR-7.1: JS语法无错误
  - `programmatic` TR-7.2: 文件同步完成
  - `human-judgement` TR-7.3: 深色/亮色主题下所有新UI正常
