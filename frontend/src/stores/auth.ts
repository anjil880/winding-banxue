import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import * as authApi from '@/api/auth'
import type { LoginForm, LoginResult, User, UserRole } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)

    const isLoggedIn = computed<boolean>(() => !!token.value)
    const isAdmin = computed<boolean>(() => user.value?.role === 'admin')
    const isTeacher = computed<boolean>(() => user.value?.role === 'teacher')
    const currentRole = computed<UserRole | undefined>(() => user.value?.role)

    /**
     * 登录。
     * @param form 登录表单
     */
    async function login(form: LoginForm): Promise<LoginResult> {
      const result = (await authApi.login(form)) as LoginResult
      if (result.token) {
        token.value = result.token
        if (result.user) {
          user.value = result.user
        }
      }
      return result
    }

    /**
     * 获取当前登录用户信息并写入 state。
     */
    async function fetchMe(): Promise<User> {
      const me = await authApi.fetchMe()
      user.value = me
      return me
    }

    /**
     * 登出：清除 token 与用户信息，并跳转登录页。
     */
    async function logout(): Promise<void> {
      try {
        await authApi.logout()
      } catch {
        // 即使接口失败也继续清理本地状态
      } finally {
        token.value = null
        user.value = null
        const router = useRouter()
        router.replace('/login')
      }
    }

    /**
     * 设置用户（用于初始化或调试）。
     */
    function setUser(u: User): void {
      user.value = u
    }

    return {
      token,
      user,
      isLoggedIn,
      isAdmin,
      isTeacher,
      currentRole,
      login,
      fetchMe,
      logout,
      setUser
    }
  },
  {
    persist: {
      paths: ['token']
    }
  }
)
