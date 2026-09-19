import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

/** 权限检查组合式函数 */
export function usePermission() {
  const authStore = useAuthStore()

  const isAdmin = (): boolean => authStore.user?.role === 'admin'
  const isTeacher = (): boolean => authStore.user?.role === 'teacher'

  /**
   * 当前用户是否在允许角色列表中。
   * @param roleList 允许访问的角色数组
   */
  const canAccess = (roleList: UserRole[]): boolean => {
    if (!roleList || roleList.length === 0) return true
    return !!authStore.user && roleList.includes(authStore.user.role)
  }

  return {
    isAdmin,
    isTeacher,
    canAccess
  }
}
