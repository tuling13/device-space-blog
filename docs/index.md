---
layout: home

hero:
  name: device空间
  text: 个人博客
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
  - title: 后端与性能
    details: Node.js、性能优化与工程化思考
  - title: 随笔与成长
    details: 学习复盘、SVG 动画和生活随想
---

<script setup>
import { data as posts } from './.vitepress/posts.data.js'
</script>

## 最新文章

<ul class="post-list">
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
    <span class="post-date">{{ post.frontmatter.date }}</span>
    <p class="post-excerpt">{{ post.frontmatter.excerpt }}</p>
  </li>
</ul>

<style>
.post-list {
  list-style: none;
  padding: 0;
}
.post-list li {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.post-list a {
  font-size: 1.1rem;
  font-weight: 600;
}
.post-date {
  display: block;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-top: 0.25rem;
}
.post-excerpt {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
}
</style>
