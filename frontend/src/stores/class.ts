import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import * as classesApi from '@/api/classes'
import * as usersApi from '@/api/users'
import { message } from '@/utils/message'
import type { ClassInfo, ClassForm, User } from '@/types'

export const useClassStore = defineStore('class', () => {
  const list = ref<ClassInfo[]>([])
  const loading = ref<boolean>(false)
  const { page, size, total, pagination, onPageChange, onSizeChange, reset: resetPagination } = usePagination()

  const filters = ref<{ keyword: string; grade: string }>({
    keyword: '',
    grade: ''
  })

  const current = ref<ClassInfo | null>(null)
  const students = ref<User[]>([])
  const availableStudents = ref<User[]>([])
  const studentDrawerVisible = ref<boolean>(false)
  const modalVisible = ref<boolean>(false)
  const studentsLoading = ref<boolean>(false)

  const isEdit = computed<boolean>(() => !!current.value?.id)

  async function fetchClasses(): Promise<void> {
    loading.value = true
    try {
      const res = await classesApi.getClasses({
        page: page.value,
        size: size.value,
        keyword: filters.value.keyword,
        grade: filters.value.grade
      })
      list.value = res.list
      total.value = res.total
      page.value = res.page
      size.value = res.size
    } finally {
      loading.value = false
    }
  }

  async function createClass(dto: ClassForm): Promise<void> {
    await classesApi.createClass(dto)
    message.success('班级创建成功')
    await fetchClasses()
  }

  async function updateClass(id: number, dto: ClassForm): Promise<void> {
    await classesApi.updateClass(id, dto)
    message.success('班级更新成功')
    await fetchClasses()
  }

  async function deleteClass(id: number): Promise<void> {
    await classesApi.deleteClass(id)
    message.success('班级已删除')
    await fetchClasses()
  }

  async function fetchClassStudents(classId: number): Promise<void> {
    studentsLoading.value = true
    try {
      students.value = await classesApi.getClassStudents(classId)
    } finally {
      studentsLoading.value = false
    }
  }

  async function fetchAvailableStudents(): Promise<void> {
    try {
      const res = await usersApi.getUsers({ page: 1, size: 1000, role: 'student', status: 'active' })
      availableStudents.value = res.list.filter(
        (s) => !students.value.some((cs) => cs.id === s.id)
      )
    } catch {
      availableStudents.value = []
    }
  }

  async function addStudents(classId: number, studentIds: number[]): Promise<void> {
    await classesApi.addClassStudents(classId, studentIds)
    message.success('学生已加入班级')
    await fetchClassStudents(classId)
    await fetchAvailableStudents()
    await fetchClasses()
  }

  async function removeStudent(classId: number, studentId: number): Promise<void> {
    await classesApi.removeClassStudent(classId, studentId)
    message.success('学生已移出班级')
    await fetchClassStudents(classId)
    await fetchAvailableStudents()
    await fetchClasses()
  }

  function openDrawer(classInfo: ClassInfo): void {
    current.value = classInfo
    studentDrawerVisible.value = true
    students.value = []
    availableStudents.value = []
    fetchClassStudents(classInfo.id)
    fetchAvailableStudents()
  }

  function closeDrawer(): void {
    studentDrawerVisible.value = false
    current.value = null
    students.value = []
    availableStudents.value = []
  }

  function openModal(classInfo?: ClassInfo): void {
    current.value = classInfo || null
    modalVisible.value = true
  }

  function closeModal(): void {
    modalVisible.value = false
    current.value = null
  }

  function resetFilters(): void {
    filters.value = { keyword: '', grade: '' }
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
    students,
    availableStudents,
    studentDrawerVisible,
    modalVisible,
    studentsLoading,
    isEdit,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    fetchClassStudents,
    fetchAvailableStudents,
    addStudents,
    removeStudent,
    openDrawer,
    closeDrawer,
    openModal,
    closeModal,
    resetFilters,
    onPageChange,
    onSizeChange
  }
})
