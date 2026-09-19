<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

interface MenuItem {
  name: string
  path: string
  roles: string[]
}

const menuItems: MenuItem[] = [
  { name: '数据总览', path: '/admin/dashboard', roles: ['admin', 'teacher'] },
  { name: '用户管理', path: '/admin/users', roles: ['admin'] },
  { name: '班级排课', path: '/admin/classes', roles: ['admin', 'teacher'] },
  { name: '题库管理', path: '/admin/questionbank', roles: ['admin', 'teacher'] }
]

const visibleMenuItems = computed<MenuItem[]>(() => {
  const role = authStore.user?.role
  if (!role) return []
  return menuItems.filter((item) => item.roles.includes(role))
})

const show = computed<boolean>(() => uiStore.sidebarCollapsed)

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function goTo(path: string): void {
  router.push(path)
  uiStore.setSidebarCollapsed(false)
}

function close(): void {
  uiStore.setSidebarCollapsed(false)
}
</script>

<template>
  <template v-if="show">
    <div class="side-menu-mask" @click="close"></div>
    <aside class="side-menu">
      <div class="side-head">
        <span class="admin-logo">
          <span class="dot"></span>
          问鼎铭校
        </span>
        <button class="btn btn-sm btn-ghost" @click="close">×</button>
      </div>
      <a
        v-for="item in visibleMenuItems"
        :key="item.path"
        :class="{ active: isActive(item.path) }"
        href="javascript:;"
        @click="goTo(item.path)"
      >
        {{ item.name }}
      </a>
    </aside>
  </template>
</template>
