# A股短线复盘看板

单文件 HTML 投资复盘工具，支持持仓总览、大盘情绪、板块热力图、备选标的管理、实时行情刷新。

## 在线地址

https://a-share-review-dashboard.pages.dev

## 部署

```bash
# 部署到 Cloudflare Pages
cd site
npx wrangler pages deploy . --project-name="a-share-review-dashboard" --branch="main"
```

## 版本回滚

```bash
# 查看版本历史
git log --oneline

# 回滚到指定版本
git checkout <commit-hash> -- a-share-review-dashboard.html
cp a-share-review-dashboard.html site/index.html
cd site && npx wrangler pages deploy . --project-name="a-share-review-dashboard" --branch="main"
```

## 更新同步

修改 `a-share-review-dashboard.html` 后：
```bash
cp a-share-review-dashboard.html site/index.html
cd site && npx wrangler pages deploy . --project-name="a-share-review-dashboard" --branch="main"
cd .. && git add -A && git commit -m "update" && git push
```
