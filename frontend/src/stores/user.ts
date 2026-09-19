import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import * as usersApi from '@/api/users'
import { message } from '@/utils/message'
import type { User, UserForm, UserRole, UserStatus, ImportResult } from '@/types'

export const useUserStore = defineStore('user', () => {
  const list = ref<User[]>([])
  const loading = ref<boolean>(false)
  const { page, size, total, pagination, onPageChange, onSizeChange, reset: resetPagination } = usePagination()

  const filters = ref<{
    keyword: string
    role: UserRole | ''
    status: UserStatus | ''
  }>({
    keyword: '',
    role: '',
    status: ''
  })

  const current = ref<User | null>(null)
  const modalVisible = ref<boolean>(false)
  const importModalVisible = ref<boolean>(false)
  const tempPassword = ref<string>('')
  const passwordModalVisible = ref<boolean>(false)

  const isEdit = computed<boolean>(() => !!current.value?.id)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    try {
      const res = await usersApi.getUsers({
        page: page.value,
        size: size.value,
        keyword: filters.value.keyword,
        role: filters.value.role,
        status: filters.value.status
      })
      list.value = res.list
      total.value = res.total
      page.value = res.page
      size.value = res.size
    } finally {
      loading.value = false
    }
  }

  async function createUser(dto: UserForm): Promise<void> {
    await usersApi.createUser(dto)
    message.success('用户创建成功')
    await fetchUsers()
  }

  async function updateUser(id: number, dto: Omit<UserForm, 'role' | 'password'>): Promise<void> {
    await usersApi.updateUser(id, dto)
    message.success('用户更新成功')
    await fetchUsers()
  }

  async function toggleStatus(id: number, active: boolean): Promise<void> {
    const status: UserStatus = active ? 'active' : 'inactive'
    await usersApi.toggleUserStatus(id, status)
    message.success(active ? '账号已启用' : '账号已停用')
    await fetchUsers()
  }

  async function resetPassword(id: number): Promise<void> {
    const res = await usersApi.resetUserPassword(id)
    tempPassword.value = res.tempPassword
    passwordModalVisible.value = true
    message.success('密码已重置')
  }

  async function deleteUser(id: number): Promise<void> {
    await usersApi.deleteUser(id)
    message.success('用户已删除')
    await fetchUsers()
  }

  async function importUsers(file: File): Promise<ImportResult> {
    const res = await usersApi.importUsers(file)
    message.success(`成功导入 ${res.imported} 位用户`)
    await fetchUsers()
    return res
  }

  function openModal(record?: User): void {
    current.value = record || null
    modalVisible.value = true
  }

  function closeModal(): void {
    modalVisible.value = false
    current.value = null
  }

  function openImportModal(): void {
    importModalVisible.value = true
  }

  function closeImportModal(): void {
    importModalVisible.value = false
  }

  function closePasswordModal(): void {
    passwordModalVisible.value = false
    tempPassword.value = ''
  }

  function resetFilters(): void {
    filters.value = { keyword: '', role: '', status: '' }
    resetPagination()
  }

  return {
    list,
    loading,
    page,
    size,
    total,
    pagination,
    filters,
    current,
    modalVisible,
    importModalVisible,
    tempPassword,
    passwordModalVisible,
    isEdit,
    fetchUsers,
    createUser,
    updateUser,
    toggleStatus,
    resetPassword,
    deleteUser,
    importUsers,
    openModal,
    closeModal,
    openImportModal,
    closeImportModal,
    closePasswordModal,
    resetFilters,
    onPageChange,
    onSizeChange
  }
})
