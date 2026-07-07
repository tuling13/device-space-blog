---
layout: home

hero:
  name: "device空间"
  text: "个人博客"
  tagline: 记录前端、技术与成长的可爱角落
  actions:
    - theme: brand
      text: 开始阅读
      link: /posts/
    - theme: alt
      text: 项目手册
      link: /dev-guide

features:
  - title: 前端技术
    details: React、TypeScript、CSS、Tailwind 等现代前端实践
    icon: 🎨
  - title: 后端与性能
    details: Node.js、性能优化与工程化思考
    icon: ⚙️
  - title: 随笔与成长
    details: 学习复盘、SVG 动画和生活随想
    icon: 🌱
---

<script setup>
import { data as posts } from './.vitepress/posts.data.js'
</script>

## 最新文章

<div class="post-grid">
  <div v-for="post in posts" :key="post.url" class="post-card">
    <h3><a :href="post.url">{{ post.frontmatter.title }}</a></h3>
    <div class="post-meta">
      <span>{{ post.frontmatter.date }}</span>
      <span>·</span>
      <span>{{ post.frontmatter.readTime }}</span>
    </div>
    <p class="post-excerpt">{{ post.frontmatter.excerpt }}</p>
    <div class="post-tags">
      <span v-for="tag in post.frontmatter.tags" :key="tag" class="post-tag">{{ tag }}</span>
    </div>
  </div>
</div>
