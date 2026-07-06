import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  Github,
  Twitter,
  Mail,
  Sparkles,
  BookOpen,
  User,
  MessageCircle,
} from 'lucide-react'
import CuteAvatar from '../components/CuteAvatar'

const posts = [
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

const allTags = [
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

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 py-3 shadow-sm backdrop-blur-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 shadow-md shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">device空间</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#posts" className="transition-colors hover:text-brand-600">文章</a>
            <a href="#tags" className="transition-colors hover:text-brand-600">标签</a>
            <a href="#about" className="transition-colors hover:text-brand-600">关于</a>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            登录
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 px-6 pt-32 pb-20">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            欢迎光临我的小角落
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            在 <span className="text-brand-600">device空间</span>
            <br />
            记录技术与生活
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            一个热爱前端、喜欢可爱设计、沉迷动效的开发者。这里分享我的学习笔记、项目实践和日常思考。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href="#posts"
              className="group flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
            >
              浏览文章
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#about"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              了解更多
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <CuteAvatar />
        </div>
      </div>
    </section>
  )
}

function PostCard({ post }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10">
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-100 to-cyan-100">
        <BookOpen className="h-12 w-12 text-brand-400 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-brand-600">
          {post.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
      </div>
    </article>
  )
}

function PostsSection() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  const tags = ['全部', ...allTags]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesTag = activeTag === '全部' || post.tags.includes(activeTag)
    return matchesSearch && matchesTag
  })

  return (
    <section id="posts" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">最新文章</h2>
          <p className="mt-2 text-slate-500">记录学习、思考与创作的点滴</p>
        </div>

        {/* 搜索与筛选 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索文章标题或内容..."
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 文章网格 */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-slate-500">没有找到相关文章，换个关键词试试～</p>
          </div>
        )}
      </div>
    </section>
  )
}

function TagsSection() {
  return (
    <section id="tags" className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">标签云</h2>
          <p className="mt-2 text-slate-500">按话题快速找到你感兴趣的内容</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {allTags.map((tag, index) => {
            const sizes = ['text-sm', 'text-base', 'text-lg']
            const size = sizes[index % sizes.length]
            return (
              <button
                key={tag}
                className={`${size} rounded-full bg-white px-5 py-2 font-medium text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white hover:shadow-md`}
              >
                <Tag className="mr-1.5 inline-block h-4 w-4" />
                {tag}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 p-8 text-white shadow-xl shadow-brand-500/20 sm:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <User className="h-14 w-14 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold sm:text-3xl">关于 device空间</h2>
              <p className="mt-3 leading-relaxed text-white/90">
                这里是 device 的个人博客，一个记录前端技术、UI 设计、动画效果与生活随笔的数字空间。
                希望每一篇文章都能给你带来一点点启发或快乐。如果你对我的内容感兴趣，欢迎通过邮箱或社交媒体联系我。
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a
                  href="mailto:hello@example.com"
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  <Mail className="h-4 w-4" />
                  联系我
                </a>
                <span className="text-sm text-white/70">已发布 {posts.length} 篇文章</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-900 px-6 py-12 text-slate-300">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">device空间</h3>
            <p className="mt-1 text-sm text-slate-400">用代码构建美好，用文字记录成长</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-rose-500 hover:text-white"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-green-500 hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} device空间. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function BlogHome() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PostsSection />
      <TagsSection />
      <AboutSection />
      <Footer />
    </div>
  )
}
