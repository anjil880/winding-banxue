<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/class'
import ModalForm from '@/components/common/ModalForm.vue'
import { required, maxLength } from '@/utils/validation'
import type { ClassForm, User } from '@/types'

const classStore = useClassStore()

const form = reactive<ClassForm>({
  name: '',
  grade: '',
  teacherId: 0,
  capacity: 50
})

const errors = reactive<Record<string, string>>({
  name: '',
  grade: '',
  teacherId: '',
  capacity: ''
})

const submitting = ref<boolean>(false)
const teachers = ref<User[]>([])
const loadingTeachers = ref<boolean>(false)

const title = computed<string>(() => (classStore.isEdit ? '编辑班级' : '新增班级'))

const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三']

async function fetchTeachers(): Promise<void> {
  loadingTeachers.value = true
  try {
    const res = await import('@/api/users').then((m) =>
      m.getUsers({ page: 1, size: 1000, role: 'teacher', status: 'active' })
    )
    teachers.value = res.list
  } catch {
    teachers.value = []
  } finally {
    loadingTeachers.value = false
  }
}

function resetForm(): void {
  const record = classStore.current
  form.name = record?.name || ''
  form.grade = record?.grade || ''
  form.teacherId = record?.teacherId || 0
  form.capacity = record?.capacity || 50
  clearErrors()
}

function clearErrors(): void {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate(): boolean {
  clearErrors()
  let valid = true

  const n = required(form.name, '班级名称')
  if (!n.valid) {
    errors.name = n.message
    valid = false
  } else {
    const ml = maxLength(form.name, 40, '班级名称')
    if (!ml.valid) {
      errors.name = ml.message
      valid = false
    }
  }

  const g = required(form.grade, '年级')
  if (!g.valid) {
    errors.grade = g.message
    valid = false
  }

  if (!form.teacherId) {
    errors.teacherId = '请选择负责老师'
    valid = false
  }

  if (form.capacity <= 0) {
    errors.capacity = '容量须大于 0'
    valid = false
  }

  return valid
}

async function onConfirm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    if (classStore.isEdit && classStore.current?.id) {
      await classStore.updateClass(classStore.current.id, { ...form })
    } else {
      await classStore.createClass({ ...form })
    }
    classStore.closeModal()
  } finally {
    submitting.value = false
  }
}

function onCancel(): void {
  classStore.closeModal()
}

watch(
  () => classStore.modalVisible,
  (visible) => {
    if (visible) {
      resetForm()
      fetchTeachers()
    }
  }
)

onMounted(() => {
  fetchTeachers()
})
</script>

<template>
  <ModalForm
    v-model:visible="classStore.modalVisible"
    :title="title"
    :loading="submitting"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="form-grid">
      <div class="form-field">
        <label class="field-label">班级名称</label>
        <input v-model="form.name" class="input" :class="{ err: errors.name }" type="text" placeholder="请输入班级名称" />
        <p v-if="errors.name" class="field-err">{{ errors.name }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">年级</label>
        <select v-model="form.grade" class="select" :class="{ err: errors.grade }">
          <option value="">请选择年级</option>
          <option v-for="g in gradeOptions" :key="g" :value="g">{{ g }}</option>
        </select>
        <p v-if="errors.grade" class="field-err">{{ errors.grade }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">负责老师</label>
        <select v-model="form.teacherId" class="select" :class="{ err: errors.teacherId }">
          <option :value="0">请选择老师</option>
          <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <p v-if="errors.teacherId" class="field-err">{{ errors.teacherId }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">容量</label>
        <input v-model.number="form.capacity" class="input" :class="{ err: errors.capacity }" type="number" min="1" placeholder="班级容量" />
        <p v-if="errors.capacity" class="field-err">{{ errors.capacity }}</p>
      </div>
    </div>
  </ModalForm>
</template>
