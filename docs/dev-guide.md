# device-space-blog 项目开发、构建与部署手册

本文档整理 `device-space-blog` 个人博客项目从开发到部署到 GitHub Pages 的完整流程，方便你在其他电脑或 Hermes Agent 上继续开发。

---

## 1. 项目概述

| 项目信息 | 内容 |
|---|---|
| 项目名称 | device空间 — 个人博客 |
| 技术栈 | Vite + React 18 + React Router DOM v7 + Tailwind CSS |
| 图标库 | lucide-react |
| 代码仓库 | https://github.com/tuling13/device-space-blog |
| 线上地址 | https://tuling13.github.io/device-space-blog/ |
| 项目手册 | https://tuling13.github.io/device-space-blog/guide |

### 页面路由

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | `BlogHome` | 博客首页 |
| `/guide` | `GuidePage` | 本开发部署手册页面 |

> 说明：因为 GitHub Pages 是静态托管，没有后端服务，所以项目去掉了原来的登录功能。本手册页面直接展示在博客中。

---

## 2. 技术栈与工具

- **Vite 5**：构建工具与开发服务器，配置 `base` 以支持 GitHub Pages 项目页子路径。
- **React 18**：UI 框架，使用 `ReactDOM.createRoot`。
- **React Router DOM v7**：客户端路由，使用 `BrowserRouter`。
- **Tailwind CSS 3**：原子化 CSS，配合 `tailwind.config.js` 自定义颜色与动画。
- **PostCSS + Autoprefixer**：处理 CSS。
- **marked**：在手册页面将 Markdown 渲染为 HTML。
- **lucide-react**：图标。
- **Git + GitHub**：版本控制与仓库托管。
- **GitHub Actions**：自动化构建与部署到 GitHub Pages。
- **Node.js 20+ / npm 10+**：运行时与包管理器。

---

## 3. 项目结构

```text
device-space-blog/
├── .github/workflows/deploy.yml   # GitHub Actions 部署工作流
├── docs/
│   └── dev-guide.md               # 本手册的 Markdown 源文件
├── public/
│   └── 404.html                   # GitHub Pages SPA 回退页面
├── src/
│   ├── App.jsx                    # 路由入口（含 basename 处理）
│   ├── main.jsx                   # React 挂载入口
│   ├── index.css                  # 全局样式 + Tailwind 指令 + 手册样式
│   ├── components/
│   │   └── CuteAvatar.jsx         # 可复用 SVG 头像
│   └── pages/
│       ├── BlogHome.jsx           # 博客首页
│       └── GuidePage.jsx          # 手册展示页面
├── index.html                     # 应用入口 HTML（含 redirect 恢复脚本）
├── package.json                   # 依赖与脚本
├── vite.config.js                 # Vite 配置（含 base 路径）
├── tailwind.config.js             # Tailwind 配置
├── postcss.config.js              # PostCSS 配置
└── dist/                          # 构建产物（由 npm run build 生成）
```

---

## 4. 开发环境准备

### 4.1 克隆仓库

```bash
git clone https://github.com/tuling13/device-space-blog.git
cd device-space-blog
```

### 4.2 安装 Node.js / npm

项目使用 Node.js 20+。本机当前版本：

```text
Node.js: v24.7.0
npm:     11.5.1
```

> 如果 Node 没有加入系统 PATH，执行 npm 命令前需要先设置 PATH。例如本机 Node 位于 `/d/software/nodejs/`，需要执行：
>
> ```bash
> export PATH="/d/software/nodejs/:$PATH"
> ```
> Windows cmd 下则使用对应路径添加到环境变量。

### 4.3 安装依赖

```bash
npm install
```

### 4.4 启动开发服务器

```bash
npm run dev
```

默认开发地址：http://localhost:5173

Vite 会监听文件变化并自动热更新。

---

## 5. 常用开发命令

`package.json` 中定义的脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |

---

## 6. 关键配置说明

### 6.1 Vite 基础路径 `vite.config.js`

GitHub Pages 项目页会挂在子路径 `/device-space-blog/` 下，因此必须设置 `base`：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/device-space-blog/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
```

### 6.2 React Router basename 处理 `src/App.jsx`

React Router v7 的 `basename` 不接受末尾斜杠，但 Vite 的 `import.meta.env.BASE_URL` 会包含 `/` 结尾。需要手动去掉：

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BlogHome from './pages/BlogHome'
import GuidePage from './pages/GuidePage'

const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### 6.3 全局样式 `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: #f0f4f8;
  color: #1e293b;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}
```

### 6.4 Tailwind 自定义配置 `tailwind.config.js`

主要扩展了品牌色、可爱主题色、字体和动画：

- `colors.background: '#f0f4f8'`
- `colors.surface: '#ffffff'`
- `colors.brand.50 ~ 700`
- `colors.cute.skin / body / blush`
- `fontFamily.sans: ['Inter', ...]`
- `animation.float / animation.shake`

完整配置见仓库 `tailwind.config.js`。

---

## 7. 生产构建

```bash
npm run build
```

构建产物输出到 `dist/`：

```text
dist/
├── 404.html
├── index.html
└── assets/
    ├── index-xxxxxxxx.css
    └── index-xxxxxxxx.js
```

构建时会做以下处理：

- Vite 将 `import.meta.env.BASE_URL` 替换为 `/device-space-blog/`
- JS/CSS 文件名加入内容哈希
- `index.html` 中的资源路径会替换为 `/device-space-blog/assets/...`
- `public/404.html` 原样复制到 `dist/404.html`
- `docs/dev-guide.md` 通过 Vite 的 `?raw` 导入被打包进 JS

本地预览生产构建：

```bash
npm run preview
```

---

## 8. 部署到 GitHub Pages

### 8.1 GitHub Actions 工作流 `.github/workflows/deploy.yml`

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
          path: dist

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

### 8.2 GitHub Pages 源设置

在 GitHub 仓库页面操作：

1. 打开仓库 → Settings → Pages
2. Build and deployment → Source
3. 选择 **GitHub Actions**
4. 保存

> 如果之前是 "Deploy from a branch"，必须改成 "GitHub Actions"，否则 Actions 部署会失败或页面不更新。

### 8.3 触发部署

每次 `push` 到 `main` 分支会自动触发工作流。也可以在 Actions 页面手动点击 "Run workflow"。

部署完成后访问：

- 首页：https://tuling13.github.io/device-space-blog/
- 手册页：https://tuling13.github.io/device-space-blog/guide

---

## 9. SPA 404 回退方案

GitHub Pages 是静态托管，不识别客户端路由。直接访问 `/guide` 会返回 404。解决方案：

### 9.1 `public/404.html`

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>device空间 — 个人博客</title>
    <script>
      sessionStorage.redirect = location.href
      var parts = location.pathname.split('/')
      var base = '/' + (parts[1] || '') + '/'
      location.replace(base)
    </script>
  </head>
  <body>
    正在跳转…
  </body>
</html>
```

### 9.2 `index.html` 中的恢复脚本

```html
<script>
  (function () {
    var redirect = sessionStorage.redirect
    if (redirect) {
      delete sessionStorage.redirect
      if (redirect !== location.href) {
        history.replaceState(null, null, redirect)
      }
    }
  })()
</script>
```

流程：

1. 用户访问 `https://tuling13.github.io/device-space-blog/guide`
2. GitHub Pages 返回 `404.html`
3. `404.html` 保存真实地址到 `sessionStorage.redirect`，然后跳转到仓库根路径 `/device-space-blog/`
4. 根路径加载 `index.html`
5. `index.html` 中的脚本读取 `sessionStorage.redirect` 并通过 `history.replaceState` 恢复成 `/device-space-blog/guide`
6. React Router 正常匹配 `/guide` 路由

---

## 10. 已踩过的坑

### 10.1 部署后页面空白，控制台提示 "No routes matched location /device-space-blog/"

原因：React Router v7 的 `basename` 不接受末尾斜杠，而 Vite 的 `BASE_URL` 带末尾斜杠。

解决：

```jsx
const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'
```

### 10.2 直接访问 `/guide` 404

原因：GitHub Pages 没有服务端路由回退。

解决：见第 9 节的 `404.html` + `index.html` 恢复脚本方案。

### 10.3 部署后仍看到旧页面

原因：GitHub Pages CDN 缓存。

解决：按 `Ctrl+F5` 强制刷新，或等待几分钟再访问。

### 10.4 本地 git push 偶发网络失败

如果直接 `git push` 出现连接超时，可以通过 GitHub Web 界面编辑文件并创建 Pull Request 合并，同样能触发部署。

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

- **Node.js 版本**：建议使用 20+。如果当前系统 PATH 中没有 Node，先安装或手动指定 Node 路径。
- **Vite 项目目录锁定**：如果正在运行 `npm run dev`，Vite 会锁定当前目录，重命名项目文件夹前要先停止所有 `node.exe` 进程。
- **Git 认证**：HTTPS 远程仓库需要配置 Git 凭证（GitHub Token 或 Credential Manager）。
- **不需要额外配置**：只要 `npm install` 完成，`npm run dev` 和 `npm run build` 即可直接使用。

### 11.3 在 Hermes Agent 上继续开发的建议

Hermes Agent 或其他 AI Agent 接手时，核心操作仍然是：

```bash
npm run dev      # 开发
npm run build    # 构建
npm run lint     # 检查
```

以及标准 Git 工作流：

```bash
git add <files>
git commit -m "描述"
git push origin main
```

可以告诉 Agent：

> 这是一个 Vite + React 18 + React Router v7 + Tailwind CSS 项目，GitHub Pages 部署在 `/device-space-blog/` 子路径下。修改路由时请注意 `BrowserRouter basename` 已做去斜杠处理；修改页面后无需手动部署，push 到 main 会触发 GitHub Actions。

---

## 12. 快速参考

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 提交并部署
git add .
git commit -m "你的提交说明"
git push origin main
```

---

## 13. 相关链接

- 代码仓库：https://github.com/tuling13/device-space-blog
- 线上博客：https://tuling13.github.io/device-space-blog/
- 项目手册：https://tuling13.github.io/device-space-blog/guide
