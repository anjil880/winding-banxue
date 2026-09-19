<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  keyword?: string
  placeholder?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  keyword: '',
  placeholder: '请输入关键词',
  debounce: 300
})

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const localKeyword = ref<string>(props.keyword)

let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.keyword,
  (val) => {
    localKeyword.value = val
  }
)

function onInput(): void {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    emit('update:keyword', localKeyword.value)
  }, props.debounce)
}

function onSearch(): void {
  if (timer) {
    clearTimeout(timer)
  }
  emit('update:keyword', localKeyword.value)
  emit('search')
}

function onReset(): void {
  localKeyword.value = ''
  emit('update:keyword', '')
  emit('reset')
}
</script>

<template>
  <div class="search-form">
    <input
      v-model="localKeyword"
      class="input keyword"
      type="text"
      :placeholder="placeholder"
      @input="onInput"
      @keydown.enter="onSearch"
    />
    <div class="filters">
      <slot />
    </div>
    <div class="actions">
      <button class="btn" @click="onReset">重置</button>
      <button class="btn btn-primary" @click="onSearch">搜索</button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
