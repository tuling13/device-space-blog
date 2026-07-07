# 文章归档

<script setup>
import { data as posts } from '../.vitepress/posts.data.js'
</script>

<ul class="post-list">
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
    <span class="post-date">{{ post.frontmatter.date }} · {{ post.frontmatter.readTime }}</span>
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
