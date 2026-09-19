/** 通用表单校验函数 */

export interface ValidationResult {
  valid: boolean
  message: string
}

/** 必填校验 */
export function required(value: string | number | undefined | null, label = '该项'): ValidationResult {
  const str = String(value ?? '').trim()
  if (str === '' || str === 'undefined' || str === 'null') {
    return { valid: false, message: `${label}不能为空` }
  }
  return { valid: true, message: '' }
}

/** 用户名：字母/数字/下划线，4-20 位 */
export function username(value: string): ValidationResult {
  const empty = required(value, '用户名')
  if (!empty.valid) return empty
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    return { valid: false, message: '用户名须为 4-20 位字母、数字或下划线' }
  }
  return { valid: true, message: '' }
}

/** 密码：6-20 位非空白字符 */
export function password(value: string): ValidationResult {
  const empty = required(value, '密码')
  if (!empty.valid) return empty
  if (!/^\S{6,20}$/.test(value)) {
    return { valid: false, message: '密码长度须为 6-20 位' }
  }
  return { valid: true, message: '' }
}

/** 手机号：中国大陆手机号 */
export function phone(value: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true, message: '' }
  }
  if (!/^1[3-9]\d{9}$/.test(value)) {
    return { valid: false, message: '手机号格式不正确' }
  }
  return { valid: true, message: '' }
}

/** 邮箱 */
export function email(value: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true, message: '' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { valid: false, message: '邮箱格式不正确' }
  }
  return { valid: true, message: '' }
}

/** 通用长度校验 */
export function maxLength(value: string, max: number, label = '内容'): ValidationResult {
  if ((value ?? '').length > max) {
    return { valid: false, message: `${label}不能超过 ${max} 个字符` }
  }
  return { valid: true, message: '' }
}
