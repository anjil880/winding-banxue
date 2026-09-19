<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from '@/components/common/Toast.vue'
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style scoped>
/* App.vue 仅作为全局入口，不添加额外布局样式 */
</style>
