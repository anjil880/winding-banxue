<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  loading?: boolean
  width?: string
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  width: '520px',
  showFooter: true,
  confirmText: '确认',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}>()

function handleConfirm(): void {
  if (props.loading) return
  emit('confirm')
}

function handleCancel(): void {
  if (props.loading) return
  emit('cancel')
  emit('update:visible', false)
}

function handleMaskClick(): void {
  if (props.loading) return
  handleCancel()
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-mask" @click.self="handleMaskClick">
      <div class="modal" :style="{ maxWidth: width }">
        <div class="modal-head">
          <span class="modal-title">{{ title }}</span>
          <button class="modal-close" :disabled="loading" @click="handleCancel">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="showFooter" class="modal-foot">
          <slot name="footer">
            <button class="btn" :disabled="loading" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button class="btn btn-primary" :disabled="loading" @click="handleConfirm">
              <span v-if="loading" class="spinner sm"></span>
              <span>{{ confirmText }}</span>
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.96);
}
</style>
