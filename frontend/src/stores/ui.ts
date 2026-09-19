import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}

export const useUIStore = defineStore('ui', () => {
  const toast = ref<ToastState>({
    visible: false,
    message: '',
    type: 'info'
  })

  const loading = ref<boolean>(false)
  const sidebarCollapsed = ref<boolean>(false)

  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function showToast(message: string, type: ToastType = 'info'): void {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }

    toast.value = { visible: true, message, type }

    toastTimer = setTimeout(() => {
      hideToast()
    }, 3000)
  }

  function hideToast(): void {
    toast.value.visible = false
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  }

  function showLoading(): void {
    loading.value = true
  }

  function hideLoading(): void {
    loading.value = false
  }

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
  }

  return {
    toast,
    loading,
    sidebarCollapsed,
    showToast,
    hideToast,
    showLoading,
    hideLoading,
    toggleSidebar,
    setSidebarCollapsed
  }
})
