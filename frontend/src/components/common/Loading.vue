<script setup lang="ts">
interface Props {
  visible: boolean
  fullScreen?: boolean
  tip?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  fullScreen: false,
  tip: '',
  size: 'md'
})
</script>

<template>
  <div v-if="visible" :class="['loading-overlay', { 'loading-fullscreen': fullScreen }]">
    <span :class="['spinner', size]"></span>
    <span v-if="tip" class="tip">{{ tip }}</span>
  </div>
</template>

<style scoped>
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}

.loading-fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  z-index: 90;
}
</style>
