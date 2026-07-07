# 文章归档

<script setup>
import { data as posts } from '../.vitepress/posts.data.js'
</script>

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
