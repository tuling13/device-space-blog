import { defineConfig } from 'vitepress'
import { getThemeConfig } from '@sugarat/theme/node'

const blogTheme = getThemeConfig({
  author: 'device',
  home: {
    name: 'device空间',
    motto: '记录前端、技术与成长的可爱角落',
    inspiring: [
      '保持热爱，奔赴山海',
      'Code the future, one line at a time',
    ],
    inspiringTimeout: 3000,
    pageSize: 10,
    avatarMode: 'card',
  },
  hotArticle: {
    title: '精选文章',
    pageSize: 6,
  },
  search: true,
  recommend: {
    style: 'sidebar',
    sort: 'date',
  },
  themeColor: 'vp-default',
  footer: {
    copyright: 'device空间 © 2026',
  },
  backToTop: true,
})

export default defineConfig({
  extends: blogTheme,
  title: 'device空间',
  description: '个人博客 — 记录前端、技术与成长',
  lang: 'zh-CN',
  base: '/device-space-blog/',
  cleanUrls: true,
  lastUpdated: false,
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tuling13/device-space-blog' },
    ],
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
  },
})
