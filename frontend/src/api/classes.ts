import { apiClient } from './client'
import type { ClassInfo, ClassForm, ClassQuery, User } from '@/types'

/** 后端分页字段 */
interface BackendPaginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 班级列表 */
export function getClasses(params: ClassQuery): Promise<{ list: ClassInfo[]; total: number; page: number; size: number }> {
  const { page = 1, size = 10, keyword = '', grade = '' } = params
  return apiClient
    .get<BackendPaginated<ClassInfo>>('/classes', {
      params: { page, pageSize: size, keyword, grade }
    })
    .then((res: unknown) => {
      const data = res as BackendPaginated<ClassInfo>
      return {
        list: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.pageSize || size
      }
    })
}

/** 创建班级 */
export function createClass(dto: ClassForm): Promise<ClassInfo> {
  return apiClient.post('/classes', dto) as Promise<ClassInfo>
}

/** 更新班级 */
export function updateClass(id: number, dto: ClassForm): Promise<ClassInfo> {
  return apiClient.patch(`/classes/${id}`, dto) as Promise<ClassInfo>
}

/** 删除班级 */
export function deleteClass(id: number): Promise<void> {
  return apiClient.delete(`/classes/${id}`) as Promise<void>
}

/** 班级学生列表 */
export function getClassStudents(classId: number): Promise<User[]> {
  return apiClient.get(`/classes/${classId}/students`) as Promise<User[]>
}

/** 批量添加学生到班级 */
export function addClassStudents(classId: number, studentIds: number[]): Promise<void> {
  return apiClient.post(`/classes/${classId}/students`, { studentIds }) as Promise<void>
}

/** 从班级移除学生 */
export function removeClassStudent(classId: number, studentId: number): Promise<void> {
  return apiClient.delete(`/classes/${classId}/students/${studentId}`) as Promise<void>
}
