import { useUIStore } from '@/stores/ui'

/**
 * 全局轻提示封装。
 * 内部调用 uiStore.showToast，供业务代码统一使用。
 */
export const message = {
  success: (msg: string): void => {
    const uiStore = useUIStore()
    uiStore.showToast(msg, 'success')
  },

  error: (msg: string): void => {
    const uiStore = useUIStore()
    uiStore.showToast(msg, 'error')
  },

  info: (msg: string): void => {
    const uiStore = useUIStore()
    uiStore.showToast(msg, 'info')
  }
}
