<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page: number
  size: number
  total: number
  sizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  sizeOptions: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:size', size: number): void
}>()

const totalPages = computed<number>(() => Math.max(1, Math.ceil(props.total / props.size)))

function goPrev(): void {
  if (props.page > 1) {
    emit('update:page', props.page - 1)
  }
}

function goNext(): void {
  if (props.page < totalPages.value) {
    emit('update:page', props.page + 1)
  }
}

function goPage(p: number): void {
  if (p >= 1 && p <= totalPages.value && p !== props.page) {
    emit('update:page', p)
  }
}

function handleSizeChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:size', Number(target.value))
}

/**
 * 生成可见页码数组，最多显示 5 个页码按钮。
 */
const visiblePages = computed<number[]>(() => {
  const current = props.page
  const last = totalPages.value
  if (last <= 5) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(last, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
</script>

<template>
  <div class="pagination">
    <span class="info">共 {{ total }} 条</span>
    <div class="pages">
      <button class="page-btn" :disabled="page <= 1" @click="goPrev">上一页</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        :class="['page-btn', { active: p === page }]"
        @click="goPage(p)"
      >
        {{ p }}
      </button>
      <button class="page-btn" :disabled="page >= totalPages" @click="goNext">下一页</button>
    </div>
    <select class="size-select" :value="size" @change="handleSizeChange">
      <option v-for="s in sizeOptions" :key="s" :value="s">{{ s }} 条/页</option>
    </select>
  </div>
</template>
