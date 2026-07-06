import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { marked } from 'marked'
import guideMd from '../../docs/dev-guide.md?raw'

export default function GuidePage() {
  const html = marked.parse(guideMd, {
    headerIds: false,
    mangle: false,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky left-0 right-0 top-0 z-50 bg-white/80 py-3 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            返回博客首页
          </Link>
          <div className="flex items-center gap-2 text-slate-800">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <span className="font-bold">项目手册</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <article
          className="markdown mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm sm:p-12"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <footer className="bg-white px-6 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} device空间. All rights reserved.
      </footer>
    </div>
  )
}
