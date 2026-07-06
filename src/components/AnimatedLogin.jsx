import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight, AlertCircle } from 'lucide-react'
import CuteAvatar from './CuteAvatar'

export default function AnimatedLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const isTypingEmail = email.length > 0
  const isTypingPassword = password.length > 0

  const validate = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要 6 位'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    setErrors({})
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('登录成功（演示）')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-3xl bg-surface shadow-2xl lg:flex-row">
        {/* 左侧：可爱小人 */}
        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:p-12">
          <div className="text-center">
            <CuteAvatar isTypingEmail={isTypingEmail} isTypingPassword={isTypingPassword} />
            <h1 className="mt-6 text-2xl font-bold text-slate-800 sm:text-3xl">欢迎回来 👋</h1>
            <p className="mt-2 text-sm text-slate-500">很高兴再次见到你</p>
          </div>
        </div>

        {/* 右侧：登录表单 */}
        <div className={`flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16 ${shake ? 'animate-shake' : ''}`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">登录账号</h2>
            <p className="mt-2 text-sm text-slate-500">请输入你的邮箱和密码继续</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${
                    errors.email ? 'border-red-400 ring-4 ring-red-100' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入你的密码"
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${
                    errors.password ? 'border-red-400 ring-4 ring-red-100' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-600">记住我</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-brand-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isLoading ? '登录中…' : '登录'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">或通过以下方式登录</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              <Chrome className="h-4 w-4" />
              Google
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            还没有账号？{' '}
            <a href="#" className="font-medium text-brand-600 transition-colors hover:text-brand-700">
              立即注册
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
