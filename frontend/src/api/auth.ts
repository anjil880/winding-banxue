import { apiClient } from './client'
import type { LoginForm, LoginResult, User } from '@/types'

/**
 * 登录。
 * @param form 登录表单
 */
export function login(form: LoginForm): Promise<LoginResult> {
  return apiClient.post('/auth/login', form) as Promise<LoginResult>
}

/**
 * 登出。
 */
export function logout(): Promise<void> {
  return apiClient.post('/auth/logout') as Promise<void>
}

/**
 * 获取当前登录用户信息。
 */
export function fetchMe(): Promise<User> {
  return apiClient.get('/auth/me') as Promise<User>
}
