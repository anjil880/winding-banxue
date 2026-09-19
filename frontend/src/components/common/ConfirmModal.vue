<script setup lang="ts">
import ModalForm from './ModalForm.vue'

interface Props {
  visible: boolean
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'primary'
}

withDefaults(defineProps<Props>(), {
  title: '确认操作',
  content: '是否确认执行该操作？',
  confirmText: '确认',
  cancelText: '取消',
  type: 'primary'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}>()

function handleConfirm(): void {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel(): void {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<template>
  <ModalForm
    :visible="visible"
    :title="title"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :width="'420px'"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p class="confirm-content">{{ content }}</p>
    <template #footer>
      <button class="btn" @click="handleCancel">{{ cancelText }}</button>
      <button :class="['btn', type === 'danger' ? 'btn-danger' : 'btn-primary']" @click="handleConfirm">
        {{ confirmText }}
      </button>
    </template>
  </ModalForm>
</template>

<style scoped>
.confirm-content {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.7;
}
</style>
