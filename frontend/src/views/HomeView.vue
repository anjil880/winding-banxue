<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('问鼎铭校 — 小升初 AI 智能伴学系统')
</script>

<template>
  <main class="home">
    <h1>{{ msg }}</h1>
    <p>学生端 / 教师端 / 管理端 脚手架已就绪</p>
  </main>
</template>

<style scoped>
.home {
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 12px;
}

p {
  color: var(--text-2);
}
</style>
