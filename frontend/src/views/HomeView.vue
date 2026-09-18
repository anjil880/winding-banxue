<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/logo.png'

const msg = ref('问鼎铭校 — 小升初 AI 智能伴学系统')
</script>

<template>
  <main class="home">
    <img class="brand-logo" :src="logo" alt="问鼎铭校 logo" />
    <h1 class="brand-name">问鼎铭校</h1>
    <p class="brand-slogan">{{ msg }}</p>
    <p>学生端 / 教师端 / 管理端 脚手架已就绪</p>
  </main>
</template>

<style scoped>
.home {
  padding: 40px 20px;
  text-align: center;
}

.brand-logo {
  height: 48px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.brand-name {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 8px;
}

.brand-slogan {
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 12px;
}

p {
  color: var(--text-2);
}
</style>
