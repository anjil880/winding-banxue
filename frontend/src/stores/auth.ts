import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: number
  role: 'student' | 'teacher' | 'admin'
  name: string
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  function setUser(u: User) {
    user.value = u
  }

  function clearUser() {
    user.value = null
  }

  return { user, isLoggedIn, setUser, clearUser }
})
