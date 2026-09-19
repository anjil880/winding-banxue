<script setup lang="ts">
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const typeIcon: Record<string, string> = {
  success: '✓',
  error: '×',
  info: 'i'
}
</script>

<template>
  <div class="toast-container">
    <Transition name="toast">
      <div v-if="uiStore.toast.visible" :class="['toast', uiStore.toast.type]">
        <span class="toast-icon">{{ typeIcon[uiStore.toast.type] }}</span>
        <span>{{ uiStore.toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
