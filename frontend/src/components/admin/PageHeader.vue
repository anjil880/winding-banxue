<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: ''
})
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">{{ title }}</div>
      <div v-if="subtitle" class="page-sub">{{ subtitle }}</div>
    </div>
    <div class="right">
      <slot />
    </div>
  </div>
</template>
