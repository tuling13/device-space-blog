import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'device空间',
  description: '个人博客 — 记录前端、技术与成长',
  lang: 'zh-CN',
  base: '/device-space-blog/',
  cleanUrls: true,
  lastUpdated: false,
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  themeConfig: {
    logo: '🚀',
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '手册', link: '/dev-guide' },
    ],

    sidebar: {
      '/dev-guide': [
        {
          text: '项目手册',
          items: [{ text: '开发、构建与部署', link: '/dev-guide' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tuling13/device-space-blog' },
    ],

    footer: {
      message: 'device空间 © 2026',
    },
  },
})
