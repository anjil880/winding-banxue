<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import ModalForm from '@/components/common/ModalForm.vue'
import { required, username as validateUsername, password as validatePassword, phone, email, maxLength } from '@/utils/validation'
import type { UserForm, UserRole } from '@/types'

const userStore = useUserStore()

const form = reactive<UserForm>({
  username: '',
  name: '',
  password: '',
  role: 'student',
  phone: '',
  email: '',
  studentNo: '',
  employeeNo: ''
})

const errors = reactive<Record<string, string>>({
  username: '',
  name: '',
  password: '',
  phone: '',
  email: '',
  studentNo: '',
  employeeNo: ''
})

const submitting = ref<boolean>(false)

const title = computed<string>(() => (userStore.isEdit ? '编辑用户' : '新增用户'))

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'student', label: '学生' },
  { value: 'teacher', label: '教师' },
  { value: 'admin', label: '管理员' }
]

function resetForm(): void {
  const record = userStore.current
  form.username = record?.username || ''
  form.name = record?.name || ''
  form.password = ''
  form.role = record?.role || 'student'
  form.phone = record?.phone || ''
  form.email = record?.email || ''
  form.studentNo = record?.studentNo || ''
  form.employeeNo = record?.employeeNo || ''
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

  const u = validateUsername(form.username)
  if (!u.valid) {
    errors.username = u.message
    valid = false
  }

  const n = required(form.name, '姓名')
  if (!n.valid) {
    errors.name = n.message
    valid = false
  }

  const ml = maxLength(form.name, 20, '姓名')
  if (!ml.valid) {
    errors.name = ml.message
    valid = false
  }

  if (!userStore.isEdit) {
    const p = validatePassword(form.password || '')
    if (!p.valid) {
      errors.password = p.message
      valid = false
    }
  }

  const ph = phone(form.phone || '')
  if (!ph.valid) {
    errors.phone = ph.message
    valid = false
  }

  const e = email(form.email || '')
  if (!e.valid) {
    errors.email = e.message
    valid = false
  }

  if (form.role === 'student') {
    const sn = required(form.studentNo, '学号')
    if (!sn.valid) {
      errors.studentNo = sn.message
      valid = false
    }
  }

  if (form.role === 'teacher') {
    const en = required(form.employeeNo, '工号')
    if (!en.valid) {
      errors.employeeNo = en.message
      valid = false
    }
  }

  return valid
}

async function onConfirm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    if (userStore.isEdit && userStore.current?.id) {
      const dto: Omit<UserForm, 'role' | 'password'> = {
        username: form.username,
        name: form.name,
        phone: form.phone,
        email: form.email,
        studentNo: form.studentNo,
        employeeNo: form.employeeNo
      }
      await userStore.updateUser(userStore.current.id, dto)
    } else {
      await userStore.createUser({ ...form })
    }
    userStore.closeModal()
  } finally {
    submitting.value = false
  }
}

function onCancel(): void {
  userStore.closeModal()
}

watch(
  () => userStore.modalVisible,
  (visible) => {
    if (visible) {
      resetForm()
    }
  }
)
</script>

<template>
  <ModalForm
    v-model:visible="userStore.modalVisible"
    :title="title"
    :loading="submitting"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="form-grid">
      <div class="form-field">
        <label class="field-label">用户名</label>
        <input v-model="form.username" class="input" :class="{ err: errors.username }" type="text" placeholder="请输入用户名" />
        <p v-if="errors.username" class="field-err">{{ errors.username }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">姓名</label>
        <input v-model="form.name" class="input" :class="{ err: errors.name }" type="text" placeholder="请输入姓名" />
        <p v-if="errors.name" class="field-err">{{ errors.name }}</p>
      </div>

      <div v-if="!userStore.isEdit" class="form-field">
        <label class="field-label">密码</label>
        <input v-model="form.password" class="input" :class="{ err: errors.password }" type="password" placeholder="请输入密码" />
        <p v-if="errors.password" class="field-err">{{ errors.password }}</p>
      </div>

      <div v-if="!userStore.isEdit" class="form-field">
        <label class="field-label">角色</label>
        <select v-model="form.role" class="select" :class="{ err: false }">
          <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="form-field">
        <label class="field-label">手机号</label>
        <input v-model="form.phone" class="input" :class="{ err: errors.phone }" type="text" placeholder="请输入手机号" />
        <p v-if="errors.phone" class="field-err">{{ errors.phone }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">邮箱</label>
        <input v-model="form.email" class="input" :class="{ err: errors.email }" type="text" placeholder="请输入邮箱" />
        <p v-if="errors.email" class="field-err">{{ errors.email }}</p>
      </div>

      <div v-if="form.role === 'student'" class="form-field">
        <label class="field-label">学号</label>
        <input v-model="form.studentNo" class="input" :class="{ err: errors.studentNo }" type="text" placeholder="请输入学号" />
        <p v-if="errors.studentNo" class="field-err">{{ errors.studentNo }}</p>
      </div>

      <div v-if="form.role === 'teacher'" class="form-field">
        <label class="field-label">工号</label>
        <input v-model="form.employeeNo" class="input" :class="{ err: errors.employeeNo }" type="text" placeholder="请输入工号" />
        <p v-if="errors.employeeNo" class="field-err">{{ errors.employeeNo }}</p>
      </div>
    </div>
  </ModalForm>
</template>
