<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermission } from '@/composables/usePermission'
import PageHeader from '@/components/admin/PageHeader.vue'
import SearchForm from '@/components/admin/SearchForm.vue'
import DataTable from '@/components/admin/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ModalForm from '@/components/common/ModalForm.vue'
import UserModal from './components/UserModal.vue'
import UserImportModal from './components/UserImportModal.vue'
import type { User } from '@/types'

const userStore = useUserStore()
const { isAdmin } = usePermission()

const statusConfirm = ref<{ visible: boolean; user: User | null; active: boolean }>({
  visible: false,
  user: null,
  active: true
})

const deleteConfirm = ref<{ visible: boolean; user: User | null }>({
  visible: false,
  user: null
})

const columns = [
  { key: 'username', title: '用户名' },
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' },
  { key: 'number', title: '学号/工号' },
  { key: 'createdAt', title: '创建时间' },
  { key: 'ops', title: '操作', width: '180px', align: 'right' as const }
]

const roleOptions = [
  { value: '', label: '全部角色' },
  { value: 'admin', label: '管理员' },
  { value: 'teacher', label: '教师' },
  { value: 'student', label: '学生' }
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' }
]

const roleMap: Record<string, string> = {
  admin: '管理员',
  teacher: '教师',
  student: '学生'
}

function onSearch(): void {
  userStore.fetchUsers()
}

function onReset(): void {
  userStore.resetFilters()
  userStore.fetchUsers()
}

function openCreateModal(): void {
  userStore.openModal()
}

function openEditModal(row: User): void {
  userStore.openModal(row)
}

function openStatusConfirm(row: User): void {
  statusConfirm.value = { visible: true, user: row, active: row.status === 'inactive' }
}

async function confirmStatusChange(): Promise<void> {
  if (!statusConfirm.value.user) return
  await userStore.toggleStatus(statusConfirm.value.user.id, statusConfirm.value.active)
  statusConfirm.value.visible = false
}

function openResetPassword(row: User): void {
  userStore.resetPassword(row.id)
}

function openDeleteConfirm(row: User): void {
  deleteConfirm.value = { visible: true, user: row }
}

async function confirmDelete(): Promise<void> {
  if (!deleteConfirm.value.user) return
  await userStore.deleteUser(deleteConfirm.value.user.id)
  deleteConfirm.value.visible = false
}

function formatDate(date?: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

function asUser(row: Record<string, unknown>): User {
  return row as unknown as User
}

watch(
  () => userStore.filters,
  () => {
    userStore.page = 1
  },
  { deep: true }
)

onMounted(() => {
  userStore.fetchUsers()
})
</script>

<template>
  <PageHeader title="用户管理" subtitle="管理系统内所有用户">
    <button class="btn btn-primary" @click="openCreateModal">+ 新增用户</button>
  </PageHeader>

  <SearchForm
    v-model:keyword="userStore.filters.keyword"
    placeholder="搜索用户名、姓名、学号/工号"
    @search="onSearch"
    @reset="onReset"
  >
    <select v-model="userStore.filters.role" class="select filter" @change="onSearch">
      <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <select v-model="userStore.filters.status" class="select filter" @change="onSearch">
      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <button class="btn" @click="userStore.openImportModal">批量导入</button>
  </SearchForm>

  <DataTable
    :columns="columns"
    :data="userStore.list as unknown as Record<string, unknown>[]"
    :loading="userStore.loading"
    :page="userStore.page"
    :size="userStore.size"
    :total="userStore.total"
    @update:page="userStore.onPageChange"
    @update:size="userStore.onSizeChange"
  >
    <template #cell-role="{ row }">
      <span class="tag" :class="asUser(row).role === 'admin' ? 'tag-red' : asUser(row).role === 'teacher' ? 'tag-blue' : 'tag-green'">
        {{ roleMap[asUser(row).role] }}
      </span>
    </template>
    <template #cell-status="{ row }">
      <span class="tag" :class="asUser(row).status === 'active' ? 'tag-green' : 'tag-gray'">
        {{ asUser(row).status === 'active' ? '启用' : '停用' }}
      </span>
    </template>
    <template #cell-number="{ row }">
      {{ asUser(row).studentNo || asUser(row).employeeNo || '-' }}
    </template>
    <template #cell-createdAt="{ row }">
      {{ formatDate(asUser(row).createdAt) }}
    </template>
    <template #cell-ops="{ row }">
      <div class="ops">
        <button class="btn btn-sm" @click="openEditModal(asUser(row))">编辑</button>
        <button
          v-if="isAdmin()"
          class="btn btn-sm"
          :class="asUser(row).status === 'active' ? 'btn-danger' : 'btn-primary'"
          @click="openStatusConfirm(asUser(row))"
        >
          {{ asUser(row).status === 'active' ? '停用' : '启用' }}
        </button>
        <button v-if="isAdmin()" class="btn btn-sm" @click="openResetPassword(asUser(row))">重置密码</button>
        <button v-if="isAdmin()" class="btn btn-sm btn-danger" @click="openDeleteConfirm(asUser(row))">删除</button>
      </div>
    </template>
  </DataTable>

  <UserModal />
  <UserImportModal />

  <ConfirmModal
    v-model:visible="statusConfirm.visible"
    :title="statusConfirm.active ? '启用账号' : '停用账号'"
    :content="statusConfirm.active
      ? `确认启用账号「${statusConfirm.user?.name || ''}」吗？`
      : `确认停用账号「${statusConfirm.user?.name || ''}」吗？停用后该账号将无法登录。`"
    @confirm="confirmStatusChange"
  />

  <ConfirmModal
    v-model:visible="deleteConfirm.visible"
    title="删除用户"
    :content="`确认删除用户「${deleteConfirm.user?.name || ''}」吗？删除后不可恢复。`"
    type="danger"
    @confirm="confirmDelete"
  />

  <ModalForm
    v-model:visible="userStore.passwordModalVisible"
    title="临时密码"
    :show-footer="false"
    @cancel="userStore.closePasswordModal"
  >
    <p class="muted" style="margin-bottom: 12px">密码重置成功，请妥善保存临时密码：</p>
    <div class="input" style="text-align: center; font-weight: 600; letter-spacing: 1px">
      {{ userStore.tempPassword }}
    </div>
  </ModalForm>
</template>

<style scoped>
.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.filter {
  min-width: 130px;
}
</style>
