<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClassStore } from '@/stores/class'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const classStore = useClassStore()
const authStore = useAuthStore()

const selectedStudentIds = ref<number[]>([])
const keyword = ref<string>('')
const activeTab = ref<'current' | 'add'>('current')

const canWrite = computed<boolean>(() => {
  if (!classStore.current) return false
  if (authStore.isAdmin) return true
  if (authStore.isTeacher && authStore.user?.id === classStore.current.teacherId) return true
  return false
})

const filteredAvailable = computed<User[]>(() => {
  if (!keyword.value) return classStore.availableStudents
  return classStore.availableStudents.filter(
    (s) => s.name.includes(keyword.value) || s.username.includes(keyword.value)
  )
})

const filteredCurrent = computed<User[]>(() => {
  if (!keyword.value) return classStore.students
  return classStore.students.filter(
    (s) => s.name.includes(keyword.value) || s.username.includes(keyword.value)
  )
})

function isSelected(id: number): boolean {
  return selectedStudentIds.value.includes(id)
}

function toggleSelect(id: number): void {
  if (isSelected(id)) {
    selectedStudentIds.value = selectedStudentIds.value.filter((sid) => sid !== id)
  } else {
    selectedStudentIds.value.push(id)
  }
}

async function addSelected(): Promise<void> {
  if (!classStore.current || selectedStudentIds.value.length === 0) return
  await classStore.addStudents(classStore.current.id, selectedStudentIds.value)
  selectedStudentIds.value = []
  activeTab.value = 'current'
}

async function removeStudent(student: User): Promise<void> {
  if (!classStore.current) return
  await classStore.removeStudent(classStore.current.id, student.id)
}

watch(
  () => classStore.studentDrawerVisible,
  (visible) => {
    if (!visible) {
      selectedStudentIds.value = []
      keyword.value = ''
      activeTab.value = 'current'
    }
  }
)
</script>

<template>
  <Transition name="drawer">
    <div v-if="classStore.studentDrawerVisible" class="drawer-mask" @click.self="classStore.closeDrawer">
      <div class="drawer">
        <div class="drawer-head">
          <div>
            <div class="drawer-title">班级学生管理</div>
            <div class="drawer-sub">{{ classStore.current?.name }} · {{ classStore.current?.grade }}</div>
          </div>
          <button class="modal-close" @click="classStore.closeDrawer">×</button>
        </div>

        <div class="drawer-tabs">
          <button :class="{ active: activeTab === 'current' }" @click="activeTab = 'current'">
            已加入学生 ({{ classStore.students.length }})
          </button>
          <button v-if="canWrite" :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">
            添加学生
          </button>
        </div>

        <div class="drawer-search">
          <input v-model="keyword" class="input" type="text" placeholder="搜索学生姓名/用户名" />
        </div>

        <div class="drawer-body">
          <div v-if="activeTab === 'current'" class="student-list">
            <div v-if="classStore.studentsLoading" class="empty">
              <div class="ico">…</div>
              <div class="d">加载中</div>
            </div>
            <template v-else-if="filteredCurrent.length > 0">
              <div v-for="student in filteredCurrent" :key="student.id" class="student-item">
                <div class="stu">
                  <div class="avatar sm">{{ student.name.slice(0, 1) }}</div>
                  <div>
                    <div class="name">{{ student.name }}</div>
                    <div class="meta">{{ student.username }}{{ student.studentNo ? ` · 学号 ${student.studentNo}` : '' }}</div>
                  </div>
                </div>
                <button v-if="canWrite" class="btn btn-sm btn-danger" @click="removeStudent(student)">移出</button>
              </div>
            </template>
            <div v-else class="empty">
              <div class="ico">👤</div>
              <div class="t">暂无学生</div>
              <div class="d">可切换到「添加学生」页签加入学生</div>
            </div>
          </div>

          <div v-else class="student-list">
            <template v-if="filteredAvailable.length > 0">
              <div
                v-for="student in filteredAvailable"
                :key="student.id"
                class="student-item selectable"
                :class="{ selected: isSelected(student.id) }"
                @click="toggleSelect(student.id)"
              >
                <div class="stu">
                  <div class="avatar sm">{{ student.name.slice(0, 1) }}</div>
                  <div>
                    <div class="name">{{ student.name }}</div>
                    <div class="meta">{{ student.username }}{{ student.studentNo ? ` · 学号 ${student.studentNo}` : '' }}</div>
                  </div>
                </div>
                <input type="checkbox" :checked="isSelected(student.id)" readonly />
              </div>
            </template>
            <div v-else class="empty">
              <div class="ico">👤</div>
              <div class="t">没有可选学生</div>
              <div class="d">请确保系统中存在状态为启用的学生账号</div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'add' && canWrite" class="drawer-foot">
          <span class="muted">已选择 {{ selectedStudentIds.length }} 人</span>
          <button class="btn" @click="selectedStudentIds = []">清空</button>
          <button class="btn btn-primary" :disabled="selectedStudentIds.length === 0" @click="addSelected">
            添加到班级
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 460px;
  background: var(--card);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.drawer-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
}

.drawer-sub {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 4px;
}

.drawer-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}

.drawer-tabs button {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-2);
  background: transparent;
  border: none;
  cursor: pointer;
}

.drawer-tabs button.active {
  background: var(--blue-soft);
  color: var(--blue);
}

.drawer-search {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--card);
}

.student-item.selectable {
  cursor: pointer;
}

.student-item.selected {
  border-color: var(--brand);
  background: var(--brand-soft);
}

.student-item .stu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-item .name {
  font-size: 14px;
  color: var(--text);
}

.student-item .meta {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.drawer-foot {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.empty {
  padding: 40px 20px;
  text-align: center;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.2s ease;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}
</style>
