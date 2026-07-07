# device-space-blog 项目开发、构建与部署手册

本文档整理 `device-space-blog` 个人博客项目从开发到部署到 GitHub Pages 的完整流程，方便你在其他电脑或 Hermes Agent 上继续开发。

---

## 1. 项目概述

| 项目信息 | 内容 |
|---|---|
| 项目名称 | device空间 — 个人博客 |
| 技术栈 | VitePress + @sugarat/theme (Meet You) |
| 代码仓库 | https://github.com/tuling13/device-space-blog |
| 线上地址 | https://tuling13.github.io/device-space-blog/ |
| 项目手册 | https://tuling13.github.io/device-space-blog/dev-guide |
| 主题文档 | https://theme.sugarat.top/ |

### 页面路由

| 路由 | 说明 |
|---|---|
| `/` | 博客首页（主题自动展示文章列表） |
| `/posts/` | 文章归档页 |
| `/posts/<文章>` | 单篇文章详情页 |
| `/dev-guide` | 本开发部署手册页面 |

---

## 2. 技术栈与工具

- **VitePress 1.x**：基于 Vite 的静态站点生成器。
- **@sugarat/theme (Meet You)**：VitePress 博客主题，提供首页博客布局、文章列表、标签云、精选文章、侧栏推荐、全文搜索（pagefind）、阅读时长统计等功能。
- **pagefind**：全文搜索引擎，构建时自动生成索引。
- **Markdown**：所有文章和手册均使用 Markdown 编写。
- **Git + GitHub**：版本控制与仓库托管。
- **GitHub Actions**：自动化构建与部署到 GitHub Pages。
- **Node.js 20+ / npm 10+**：运行时与包管理器。

---

## 3. 项目结构

```text
device-space-blog/
├── .github/workflows/deploy.yml   # GitHub Actions 部署工作流
├── docs/                          # VitePress 站点根目录
│   ├── .vitepress/
│   │   ├── config.js              # VitePress + 主题配置
│   │   ├── theme/
│   │   │   ├── index.js           # 主题注册入口
│   │   │   └── style.css          # 自定义样式覆盖
│   │   └── dist/                  # 构建产物（npm run build 生成）
│   ├── index.md                   # 博客首页（layout: home + blog 配置）
│   ├── dev-guide.md               # 本手册
│   └── posts/                     # 博客文章目录
│       ├── react-19-new-features.md
│       ├── tailwind-design-system.md
│       ├── nodejs-performance.md
│       ├── 2026-mid-year-review.md
│       ├── svg-animation.md
│       └── typescript-advanced-types.md
├── package.json                   # 依赖与脚本
├── package-lock.json              # 锁定依赖版本
└── node_modules/                  # 本地依赖
```

---

## 4. 开发环境准备

### 4.1 克隆仓库

```bash
git clone https://github.com/tuling13/device-space-blog.git
cd device-space-blog
```

### 4.2 安装依赖

```bash
npm install
```

### 4.3 启动开发服务器

```bash
npm run dev
```

默认开发地址：http://localhost:5173

VitePress 会监听文件变化并自动热更新。

---

## 5. 常用开发命令

`package.json` 中定义的脚本：

```json
{
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs"
  }
}
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本到 `docs/.vitepress/dist/`（含 pagefind 索引） |
| `npm run preview` | 本地预览生产构建 |

---

## 6. 关键配置说明

### 6.1 VitePress 配置 `docs/.vitepress/config.js`

使用 `@sugarat/theme/node` 提供的 `getThemeConfig()` 扩展 VitePress 配置：

```js
import { defineConfig } from 'vitepress'
import { getThemeConfig } from '@sugarat/theme/node'

const blogTheme = getThemeConfig({
  author: 'device',
  home: {
    name: 'device空间',
    motto: '记录前端、技术与成长的可爱角落',
    inspiring: ['保持热爱，奔赴山海', 'Code the future, one line at a time'],
    pageSize: 10,
    avatarMode: 'card',
  },
  hotArticle: { title: '精选文章', pageSize: 6 },
  search: true,
  recommend: { style: 'sidebar', sort: 'date' },
  backToTop: true,
})

export default defineConfig({
  extends: blogTheme,
  title: 'device空间',
  base: '/device-space-blog/',
  cleanUrls: true,
  // ... 其他 VitePress 配置
})
```

主题配置选项参考：https://theme.sugarat.top/config/global.html

### 6.2 主题注册 `docs/.vitepress/theme/index.js`

```js
import BlogTheme from '@sugarat/theme'
import './style.css'

export default {
  ...BlogTheme,
  enhanceApp(ctx) {
    BlogTheme?.enhanceApp?.(ctx)
  },
}
```

### 6.3 首页 `docs/index.md`

使用 `layout: home` 和 `blog:` 块配置首页：

```md
---
layout: home
blog:
  name: 'device空间'
  motto: 记录前端、技术与成长的可爱角落
  inspiring:
    - 保持热爱，奔赴山海
  pageSize: 10
  author: device
  avatarMode: card
---
```

主题会自动在首页展示文章卡片、标签云和精选文章，无需手动编写 Vue 组件。

---

## 7. 如何撰写新文章

所有文章都是 `docs/posts/` 目录下的 Markdown 文件，主题会自动发现并展示。

### 7.1 创建文件

在 `docs/posts/` 下新建一个 `.md` 文件，文件名会成为 URL 的一部分。例如 `docs/posts/my-first-post.md` 对应 `/posts/my-first-post`。

### 7.2 填写 frontmatter

在文件最顶部添加：

```md
---
title: 你的文章标题
date: 2026-07-07
tag:
  - 前端
  - React
description: 这篇文章的简短摘要，会显示在首页卡片上。
---
```

frontmatter 字段说明：

| 字段 | 说明 |
|---|---|
| `title` | 文章标题 |
| `date` | 发布日期（格式 YYYY-MM-DD） |
| `tag` | 标签数组，用于分类和筛选 |
| `description` | 文章摘要，显示在首页卡片上 |
| `cover` | 封面图片 URL（可选，默认取文章内第一张图） |
| `sticky` | 置顶权重，数值越大越靠前（可选） |
| `hidden` | 设为 `true` 则不在首页显示（可选） |
| `publish` | 设为 `false` 则完全隐藏（不发布） |

> 注意：阅读时长由主题自动计算，无需手动填写 `readTime`。

### 7.3 编写正文

frontmatter 之后直接写 Markdown 正文即可：

```md
# 你的文章标题

这里是正文内容。
```

### 7.4 本地预览

保存后刷新 http://localhost:5173 即可看到新文章。

### 7.5 发布

```bash
git add docs/posts/my-first-post.md
git commit -m "add: 新文章《你的文章标题》"
git push origin main
```

推送后 GitHub Actions 会自动构建部署，几分钟后即可在线上首页看到新文章。

---

## 8. 生产构建

```bash
npm run build
```

构建产物输出到 `docs/.vitepress/dist/`：

```text
docs/.vitepress/dist/
├── index.html
├── 404.html
├── dev-guide.html
├── posts/
│   └── ...
├── pagefind/           # 全文搜索索引
└── assets/
    └── ...
```

本地预览生产构建：

```bash
npm run preview
```

---

## 9. 部署到 GitHub Pages

### 9.1 GitHub Actions 工作流 `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 9.2 GitHub Pages 源设置

在 GitHub 仓库页面操作：

1. 打开仓库 → Settings → Pages
2. Build and deployment → Source
3. 选择 **GitHub Actions**
4. 保存

### 9.3 触发部署

每次 `push` 到 `main` 分支会自动触发工作流。也可以在 Actions 页面手动点击 "Run workflow"。

部署完成后访问：

- 首页：https://tuling13.github.io/device-space-blog/
- 手册页：https://tuling13.github.io/device-space-blog/dev-guide

---

## 10. 已踩过的坑

### 10.1 部署后页面空白或资源 404

原因：GitHub Pages 项目页挂在子路径下，VitePress 的 `base` 没有设置或设置错误。

解决：在 `docs/.vitepress/config.js` 中配置 `base: '/device-space-blog/'`。

### 10.2 直接访问 `/posts/xxx` 返回 404

原因：GitHub Pages 是静态托管，没有服务端路由回退。

解决：VitePress 构建会生成 `404.html`，GitHub Pages 会用它处理未知路径，VitePress 客户端路由接管后会显示对应页面。

### 10.3 部署后仍看到旧页面

原因：GitHub Pages CDN 缓存。

解决：按 `Ctrl+F5` 强制刷新，或等待几分钟再访问。

### 10.4 VitePress 构建报死链错误

原因：文档中包含 `http://localhost:5173` 等开发地址。

解决：在 config 中设置 `ignoreDeadLinks: [/^https?:\/\/localhost/]`。

---

## 11. 迁移到其他电脑 / Hermes Agent 继续开发

### 11.1 标准流程

```bash
# 1. 克隆仓库
git clone https://github.com/tuling13/device-space-blog.git
cd device-space-blog

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 11.2 在新环境需要注意的事项

- **Node.js 版本**：建议使用 20+。
- **Git 认证**：HTTPS 远程仓库需要配置 Git 凭证（GitHub Token 或 Credential Manager）。
- **不需要额外配置**：只要 `npm install` 完成，`npm run dev` 和 `npm run build` 即可直接使用。

### 11.3 在 Hermes Agent 上继续开发的建议

Hermes Agent 或其他 AI Agent 接手时，核心操作仍然是：

```bash
npm run dev      # 开发
npm run build    # 构建
```

以及标准 Git 工作流：

```bash
git add <files>
git commit -m "描述"
git push origin main
```

可以告诉 Agent：

> 这是一个使用 @sugarat/theme (Meet You) 主题的 VitePress 博客项目，GitHub Pages 部署在 `/device-space-blog/` 子路径下。新增文章时，在 `docs/posts/` 下创建 Markdown 文件并填写 frontmatter（title、date、tag、description）；主题配置在 `docs/.vitepress/config.js` 的 `getThemeConfig()` 中；push 到 main 会触发 GitHub Actions 自动部署。主题文档：https://theme.sugarat.top/

---

## 12. 快速参考

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览生产构建
npm run preview

# 提交并部署
git add .
git commit -m "你的提交说明"
git push origin main
```

---

## 13. 相关链接

- 代码仓库：https://github.com/tuling13/device-space-blog
- 线上博客：https://tuling13.github.io/device-space-blog/
- 项目手册：https://tuling13.github.io/device-space-blog/dev-guide
- 主题文档：https://theme.sugarat.top/
- 主题 GitHub：https://github.com/ATQQ/sugar-blog
