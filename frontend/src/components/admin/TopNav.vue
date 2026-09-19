<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

interface NavItem {
  name: string
  path: string
  roles: string[]
}

const navItems: NavItem[] = [
  { name: '数据总览', path: '/admin/dashboard', roles: ['admin', 'teacher'] },
  { name: '用户管理', path: '/admin/users', roles: ['admin'] },
  { name: '班级排课', path: '/admin/classes', roles: ['admin', 'teacher'] },
  { name: '题库管理', path: '/admin/questionbank', roles: ['admin', 'teacher'] }
]

const visibleNavItems = computed<NavItem[]>(() => {
  const role = authStore.user?.role
  if (!role) return []
  return navItems.filter((item) => item.roles.includes(role))
})

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function goTo(path: string): void {
  router.push(path)
}

function toggleMenu(): void {
  uiStore.toggleSidebar()
}

async function handleLogout(): Promise<void> {
  await authStore.logout()
}

const displayName = computed<string>(() => authStore.user?.name || '管理员')

const avatarText = computed<string>(() => {
  const name = authStore.user?.name || '管'
  return name.slice(0, 1)
})
</script>

<template>
  <header class="admin-topbar">
    <div class="admin-logo" @click="goTo('/admin/dashboard')">
      <span class="dot"></span>
      问鼎铭校 · 管理后台
    </div>

    <nav class="admin-nav">
      <a
        v-for="item in visibleNavItems"
        :key="item.path"
        :class="{ active: isActive(item.path) }"
        href="javascript:;"
        @click="goTo(item.path)"
      >
        {{ item.name }}
      </a>
    </nav>

    <button class="menu-toggle" @click="toggleMenu">☰</button>

    <div class="admin-user">
      <span class="name">{{ displayName }}</span>
      <div class="avatar">{{ avatarText }}</div>
      <button class="btn btn-sm btn-ghost" @click="handleLogout">退出</button>
    </div>
  </header>
</template>

<style scoped>
.admin-logo {
  cursor: pointer;
}
</style>
