import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from '@/utils/message'
import type { RouteRecordRaw } from 'vue-router'
import type { UserRole } from '@/types'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/admin/LoginView.vue'),
    meta: { public: true, layout: 'blank' }
  },
  {
    path: '/admin',
    component: () => import('@/components/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { role: ['admin', 'teacher'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '数据总览', role: ['admin', 'teacher'] }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManageView.vue'),
        meta: { title: '用户管理', role: ['admin'] }
      },
      {
        path: 'classes',
        name: 'AdminClasses',
        component: () => import('@/views/admin/ClassManageView.vue'),
        meta: { title: '班级排课', role: ['admin', 'teacher'] }
      },
      {
        path: 'questionbank',
        name: 'AdminQuestionBank',
        component: () => import('@/views/admin/QuestionBankView.vue'),
        meta: { title: '题库管理', role: ['admin', 'teacher'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const { token, user } = auth

  // 1. 已登录访问 /login => /admin/dashboard
  if (to.path === '/login' && token) {
    return next('/admin/dashboard')
  }

  // 2. 未登录访问非公开页 => /login
  if (!to.meta.public && !token) {
    return next('/login')
  }

  // 3. 角色权限校验（meta.role）
  const requiredRoles = to.meta.role as UserRole[] | undefined
  if (requiredRoles && requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    message.error('无权限访问该页面')
    return next(false)
  }

  next()
})

export default router
