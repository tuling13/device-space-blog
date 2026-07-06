// 博客文章数据
// 新增文章时，在这个数组最前面插入一个新对象即可。
// 字段说明：
//   id: 唯一编号（建议递增）
//   title: 文章标题
//   excerpt: 文章摘要，会显示在首页卡片上
//   date: 发布日期，格式 YYYY-MM-DD
//   readTime: 预计阅读时长，例如 "8 分钟"
//   tags: 标签数组，建议从 allTags 中选取
//   featured: 是否置顶推荐（目前首页暂未使用，可预留）

export const posts = [
  {
    id: 1,
    title: 'React 19 新特性速览：从 use 到 Server Components',
    excerpt:
      'React 19 带来了许多激动人心的更新，包括新的 use API、自动记忆化、改进的表单处理以及 Server Components 的进一步成熟。',
    date: '2026-06-28',
    readTime: '8 分钟',
    tags: ['React', '前端'],
    featured: true,
  },
  {
    id: 2,
    title: '用 Tailwind CSS 打造可维护的设计系统',
    excerpt:
      '从颜色、间距到组件抽象，分享我在多个项目中沉淀的 Tailwind 设计系统实践经验。',
    date: '2026-06-20',
    readTime: '6 分钟',
    tags: ['CSS', 'Tailwind'],
    featured: false,
  },
  {
    id: 3,
    title: 'Node.js 性能优化：从事件循环到内存管理',
    excerpt:
      '深入理解 Node.js 运行时的核心机制，掌握常见的性能瓶颈排查与优化手段。',
    date: '2026-06-12',
    readTime: '12 分钟',
    tags: ['Node.js', '后端'],
    featured: false,
  },
  {
    id: 4,
    title: '我的 2026 年中技术复盘',
    excerpt:
      '回顾上半年学习的新技术、参与的项目，以及对下半年的一些计划和思考。',
    date: '2026-06-05',
    readTime: '5 分钟',
    tags: ['随笔', '成长'],
    featured: false,
  },
  {
    id: 5,
    title: 'SVG 动画入门：让页面活起来的小技巧',
    excerpt:
      '不需要依赖复杂的动画库，仅用 SVG 和 CSS 就能实现流畅可爱的交互动画。',
    date: '2026-05-28',
    readTime: '7 分钟',
    tags: ['SVG', '动画'],
    featured: false,
  },
  {
    id: 6,
    title: 'TypeScript 高级类型体操：条件类型与映射类型',
    excerpt:
      '通过实际案例理解 TypeScript 类型系统的强大之处，写出更健壮的代码。',
    date: '2026-05-18',
    readTime: '10 分钟',
    tags: ['TypeScript'],
    featured: false,
  },
]

// 标签池，用于首页标签云和文章筛选
export const allTags = [
  'React',
  'TypeScript',
  'CSS',
  'Tailwind',
  'Node.js',
  '前端',
  '后端',
  'SVG',
  '动画',
  '随笔',
  '成长',
]
