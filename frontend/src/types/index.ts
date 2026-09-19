/** 问鼎铭校 · 管理端全局 TypeScript 类型 */

/** 用户角色 */
export type UserRole = 'student' | 'teacher' | 'admin'

/** 用户状态 */
export type UserStatus = 'active' | 'inactive'

/** 用户基础信息 */
export interface User {
  id: number
  username: string
  name: string
  role: UserRole
  status: UserStatus
  phone?: string
  email?: string
  studentNo?: string
  employeeNo?: string
  avatar?: string
  createdAt?: string
}

/** 班级信息 */
export interface ClassInfo {
  id: number
  name: string
  grade: string
  teacherId: number
  teacherName: string
  capacity: number
  studentCount: number
  createdAt?: string
}

/** 知识点节点 */
export interface KnowledgeNode {
  id: number
  name: string
  level: 1 | 2 | 3
  parentId: number | null
  children?: KnowledgeNode[]
}

/** 题目类型 */
export type QuestionType = 'choice' | 'fill' | 'calculation' | 'answer'

/** 难度 */
export type Difficulty = 'basic' | 'advanced' | 'challenge'

/** 题目 */
export interface Question {
  id: number
  stem: string
  options: string[]
  answer: string | string[]
  analysis?: string
  knowledgePointId?: number
  type: QuestionType
  difficulty: Difficulty
  tagged: boolean
  source?: string
}

/** 统一 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

/** 分页数据 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/** 登录表单 */
export interface LoginForm {
  username: string
  password: string
  role?: UserRole
}

/** 登录结果 */
export interface LoginResult {
  token: string
  user?: User
}

/** 用户查询参数 */
export interface UserQuery {
  page?: number
  size?: number
  keyword?: string
  role?: UserRole | ''
  status?: UserStatus | ''
}

/** 用户表单 */
export interface UserForm {
  username: string
  name: string
  password?: string
  role: UserRole
  phone?: string
  email?: string
  studentNo?: string
  employeeNo?: string
}

/** 班级查询参数 */
export interface ClassQuery {
  page?: number
  size?: number
  keyword?: string
  grade?: string
}

/** 班级表单 */
export interface ClassForm {
  name: string
  grade: string
  teacherId: number
  capacity: number
}

/** 题目查询参数 */
export interface QuestionQuery {
  page?: number
  size?: number
  keyword?: string
  type?: QuestionType | ''
  difficulty?: Difficulty | ''
  knowledgePointId?: number
}

/** 题目表单 */
export interface QuestionForm {
  stem: string
  options: string[]
  answer: string | string[]
  analysis?: string
  knowledgePointId?: number
  type: QuestionType
  difficulty: Difficulty
}

/** 批量导入结果 */
export interface ImportResult {
  imported: number
  errors: Array<{ row: number; field: string; message: string }>
}

/** 路由元信息 */
export interface RouteMeta {
  title?: string
  public?: boolean
  role?: UserRole[]
}
