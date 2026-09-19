<script setup lang="ts">
import { computed } from 'vue'
import Pagination from './Pagination.vue'

export interface TableColumn {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  loading?: boolean
  emptyText?: string
  page?: number
  size?: number
  total?: number
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: '暂无数据',
  page: 1,
  size: 10,
  total: 0,
  showPagination: true
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:size', size: number): void
}>()

function handlePageChange(p: number): void {
  emit('update:page', p)
}

function handleSizeChange(s: number): void {
  emit('update:size', s)
}

function getCellValue(row: Record<string, unknown>, key: string): unknown {
  return row[key]
}

const hasPagination = computed<boolean>(() => props.showPagination && props.total > 0)
</script>

<template>
  <div class="card-flat table-wrapper" :class="{ 'table-loading': loading }">
    <table class="table-admin">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width, textAlign: col.align || 'left' }"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align || 'left' }"
          >
            <slot :name="`cell-${col.key}`" :row="row" :index="index">
              {{ getCellValue(row, col.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.length === 0" class="table-empty">
      {{ loading ? '加载中...' : emptyText }}
    </div>
    <Pagination
      v-if="hasPagination"
      :page="page"
      :size="size"
      :total="total"
      @update:page="handlePageChange"
      @update:size="handleSizeChange"
    />
  </div>
</template>
