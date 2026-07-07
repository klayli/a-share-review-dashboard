# Tasks

- [x] Task 1: 查询 API 获取所有热点题材关联的真实个股
  - [x] 1.1 查询 BK1036(半导体) 成分股 Top 3
  - [x] 1.2 查询 BK1127(AI芯片) 成分股 Top 3
  - [x] 1.3 查询 BK1128(CPO概念) 成分股 Top 3
  - [x] 1.4 查询 BK1090(机器人概念) 成分股 Top 3
  - [x] 1.5 查询 BK0732(贵金属) 成分股 Top 3
  - [x] 1.6 查询 BK0478(有色金属) 成分股 Top 3
  - [x] 1.7 查询 BK0436(纺织服饰) 成分股 Top 3
  - [x] 1.8 查询 BK0433(农林牧渔) 成分股 Top 3
  - [x] 1.9 查询 BK0438(食品饮料) 成分股 Top 3
  - [x] 1.10 查询 BK0882(猪肉概念) 成分股 Top 3
  - [x] 1.11 查询 BK0888(农业种植) 成分股 Top 3

- [x] Task 2: 更新 DAYS 数组中所有 hotThemes.stocks
  - [x] 2.1 为每个 hotThemes 条目添加 `bkCode` 字段
  - [x] 2.2 将 `stocks` 字段替换为 API 查询的真实代表个股（格式：`名称(代码) · 名称(代码) · 名称(代码)`）
  - [x] 2.3 确保每个 `stocks` 与对应 `sectorHeat.leaders` 不同

- [x] Task 3: 添加 BK_CODE_MAP 和 fetchSectorStocks() 函数
  - [x] 3.1 在代码中添加 `BK_CODE_MAP` 常量（热点题材→BK代码映射）
  - [x] 3.2 添加 `fetchSectorStocks(bkCode)` 异步函数，调用 Eastmoney API 获取板块成分股
  - [x] 3.3 函数返回格式：`[{code, name}, ...]`，按市值排序取前 3

- [x] Task 4: 版本号更新 + 同步 + 预览
  - [x] 4.1 更新 `APP_VERSION` 为 `v1.39.6`
  - [x] 4.2 更新 `APP_RELEASE_NOTES` 和 `VERSION_HISTORY`
  - [x] 4.3 更新 `site/versions.json` 和 `versions.json`
  - [x] 4.4 同步文件并启动预览

# Task Dependencies

- Task 2 依赖 Task 1（需要 API 数据）
- Task 3 可独立执行
- Task 4 依赖 Task 1, 2, 3