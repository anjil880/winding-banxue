import { apiClient } from './client'
import type { User, UserForm, UserQuery, UserStatus, ImportResult } from '@/types'

/** 后端分页字段 */
interface BackendPaginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 用户列表 */
export function getUsers(params: UserQuery): Promise<{ list: User[]; total: number; page: number; size: number }> {
  const { page = 1, size = 10, keyword = '', role = '', status = '' } = params
  return apiClient
    .get<BackendPaginated<User>>('/users', {
      params: { page, pageSize: size, keyword, role, status }
    })
    .then((res: unknown) => {
      const data = res as BackendPaginated<User>
      return {
        list: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.pageSize || size
      }
    })
}

/** 创建用户 */
export function createUser(dto: UserForm): Promise<User> {
  return apiClient.post('/users', dto) as Promise<User>
}

/** 更新用户（不含 role、password） */
export function updateUser(id: number, dto: Omit<UserForm, 'role' | 'password'>): Promise<User> {
  return apiClient.patch(`/users/${id}`, dto) as Promise<User>
}

/** 删除用户 */
export function deleteUser(id: number): Promise<void> {
  return apiClient.delete(`/users/${id}`) as Promise<void>
}

/** 启用/停用用户 */
export function toggleUserStatus(id: number, status: UserStatus): Promise<User> {
  return apiClient.patch(`/users/${id}/status`, { status }) as Promise<User>
}

/** 重置密码 */
export function resetUserPassword(id: number): Promise<{ tempPassword: string }> {
  return apiClient.post(`/users/${id}/reset-password`) as Promise<{ tempPassword: string }>
}

/** 批量导入用户 */
export function importUsers(file: File): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post('/users/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as Promise<ImportResult>
}
