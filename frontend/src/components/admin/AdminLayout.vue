<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './TopNav.vue'
import SideMenu from './SideMenu.vue'

const route = useRoute()

watch(
  () => route.meta.title,
  (title) => {
    if (title && typeof title === 'string') {
      document.title = `${title} · 问鼎铭校管理后台`
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-shell">
    <TopNav />
    <SideMenu />
    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>
