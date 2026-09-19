<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { username as validateUsername, password as validatePassword } from '@/utils/validation'
import type { LoginForm, UserRole } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const role = ref<UserRole>('admin')
const submitting = ref<boolean>(false)
const form = reactive<LoginForm>({ username: '', password: '' })
const errors = reactive<Record<string, string>>({ username: '', password: '' })

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'teacher', label: '教师' },
  { value: 'student', label: '学生' }
]

function validate(): boolean {
  errors.username = ''
  errors.password = ''
  const u = validateUsername(form.username)
  if (!u.valid) {
    errors.username = u.message
  }
  const p = validatePassword(form.password)
  if (!p.valid) {
    errors.password = p.message
  }
  return !errors.username && !errors.password
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    await authStore.login({ ...form, role: role.value })
    await router.push('/admin/dashboard')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="dot"></span>
        <span>问鼎铭校 · 管理后台</span>
      </div>
      <h1 class="login-title">欢迎登录</h1>
      <p class="login-sub">请输入账号密码进入系统</p>

      <div class="role-segment">
        <button
          v-for="item in roles"
          :key="item.value"
          :class="['role-btn', { active: role === item.value }]"
          type="button"
          @click="role = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <form class="login-form" @submit.prevent="onSubmit">
        <div class="form-field">
          <label class="field-label">用户名</label>
          <input
            v-model="form.username"
            class="input"
            :class="{ err: errors.username }"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
          <p v-if="errors.username" class="field-err">{{ errors.username }}</p>
        </div>

        <div class="form-field">
          <label class="field-label">密码</label>
          <input
            v-model="form.password"
            class="input"
            :class="{ err: errors.password }"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          <p v-if="errors.password" class="field-err">{{ errors.password }}</p>
        </div>

        <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner sm"></span>
          <span>登 录</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg);
}

.login-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 36px 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 24px;
}

.login-brand .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--blue);
}

.login-title {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: var(--text);
}

.login-sub {
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
  margin-top: 6px;
  margin-bottom: 24px;
}

.role-segment {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.role-btn {
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.role-btn:hover {
  border-color: var(--text-3);
  color: var(--text);
}

.role-btn.active {
  background: var(--brand-soft);
  border-color: var(--brand);
  color: var(--brand);
}

.login-form .form-field {
  margin-bottom: 18px;
}
</style>
