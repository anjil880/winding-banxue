<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClassStore } from '@/stores/class'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/admin/PageHeader.vue'
import SearchForm from '@/components/admin/SearchForm.vue'
import DataTable from '@/components/admin/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ClassModal from './components/ClassModal.vue'
import ClassStudentDrawer from './components/ClassStudentDrawer.vue'
import type { ClassInfo } from '@/types'

const classStore = useClassStore()
const authStore = useAuthStore()

const deleteConfirm = ref<{ visible: boolean; row: ClassInfo | null }>({
  visible: false,
  row: null
})

const columns = [
  { key: 'name', title: '班级名称' },
  { key: 'grade', title: '年级' },
  { key: 'teacherName', title: '负责老师' },
  { key: 'studentCount', title: '学生数', align: 'right' as const },
  { key: 'ops', title: '操作', width: '220px', align: 'right' as const }
]

function canEdit(row: ClassInfo): boolean {
  if (authStore.isAdmin) return true
  if (authStore.isTeacher && authStore.user?.id === row.teacherId) return true
  return false
}

function onSearch(): void {
  classStore.fetchClasses()
}

function onReset(): void {
  classStore.resetFilters()
  classStore.fetchClasses()
}

function openCreateModal(): void {
  classStore.openModal()
}

function openEditModal(row: ClassInfo): void {
  classStore.openModal(row)
}

function openManageStudents(row: ClassInfo): void {
  classStore.openDrawer(row)
}

function openDeleteConfirm(row: ClassInfo): void {
  deleteConfirm.value.row = row
  deleteConfirm.value.visible = true
}

async function confirmDelete(): Promise<void> {
  if (!deleteConfirm.value.row) return
  await classStore.deleteClass(deleteConfirm.value.row.id)
  deleteConfirm.value.row = null
  deleteConfirm.value.visible = false
}

function asClassInfo(row: Record<string, unknown>): ClassInfo {
  return row as unknown as ClassInfo
}

onMounted(() => {
  classStore.fetchClasses()
})
</script>

<template>
  <PageHeader title="班级排课" subtitle="管理班级基础信息与学生">
    <button v-if="authStore.isAdmin" class="btn btn-primary" @click="openCreateModal">+ 新增班级</button>
  </PageHeader>

  <SearchForm
    v-model:keyword="classStore.filters.keyword"
    placeholder="搜索班级名称、年级"
    @search="onSearch"
    @reset="onReset"
  />

  <DataTable
    :columns="columns"
    :data="classStore.list as unknown as Record<string, unknown>[]"
    :loading="classStore.loading"
    :page="classStore.page"
    :size="classStore.size"
    :total="classStore.total"
    @update:page="classStore.onPageChange"
    @update:size="classStore.onSizeChange"
  >
    <template #cell-studentCount="{ row }">
      <span class="num">{{ asClassInfo(row).studentCount || 0 }}</span>
    </template>
    <template #cell-ops="{ row }">
      <div class="ops">
        <button v-if="canEdit(asClassInfo(row))" class="btn btn-sm" @click="openEditModal(asClassInfo(row))">编辑</button>
        <button class="btn btn-sm btn-blue" @click="openManageStudents(asClassInfo(row))">管理学生</button>
        <button v-if="authStore.isAdmin" class="btn btn-sm btn-danger" @click="openDeleteConfirm(asClassInfo(row))">删除</button>
      </div>
    </template>
  </DataTable>

  <ClassModal />
  <ClassStudentDrawer />

  <ConfirmModal
    v-model:visible="deleteConfirm.visible"
    title="删除班级"
    :content="`确认删除班级「${deleteConfirm.row?.name || ''}」吗？删除后班级内的学生绑定将被解除。`"
    type="danger"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
