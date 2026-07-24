import { defineConfig } from 'vitepress'
import { getThemeConfig } from '@sugarat/theme/node'

const blogTheme = getThemeConfig({
  author: 'device',
  home: {
    name: 'device空间',
    motto: '记录前端、技术与成长的可爱角落',
    logo: '/logo.svg',
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
      { text: 'AI', link: '/posts/ai/' },
      { text: '后端', link: '/posts/backend/' },
      { text: '文章', link: '/posts/' },
      { text: '手册', link: '/dev-guide' },
    ],
    sidebar: {
      '/posts/ai/': [
        {
          text: 'AI',
          items: [
            { text: '概述', link: '/posts/ai/' },
            { text: 'Hermes 接入 DeepSeek', link: '/posts/ai/hermes-deepseek' },
            { text: 'OpenClaw 接入 DeepSeek', link: '/posts/ai/openclaw-deepseek' },
            { text: 'Claude Code 接入 DeepSeek', link: '/posts/ai/claude-code-deepseek' },
          ],
        },
      ],
      '/posts/backend/': [
        {
          text: '后端',
          items: [
            { text: '概述', link: '/posts/backend/' },
            { text: 'Redis 缓存实战', link: '/posts/backend/redis-cache-strategy' },
            { text: 'MySQL 性能优化', link: '/posts/backend/mysql-optimization' },
            { text: '消息队列设计模式', link: '/posts/backend/message-queue-patterns' },
            { text: 'ADMQ RabbitMQ Federation 双向MQTT配置', link: '/posts/backend/admq-rabbitmq-federation' },
          ],
        },
      ],
      '/dev-guide': [
        {
          text: '项目手册',
          items: [{ text: '开发、构建与部署', link: '/dev-guide' }],
        },
      ],
    },
  },
})
