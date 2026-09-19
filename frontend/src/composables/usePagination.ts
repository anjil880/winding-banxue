import { computed, ref, type Ref } from 'vue'

export interface PaginationReturn {
  page: Ref<number>
  size: Ref<number>
  total: Ref<number>
  pagination: Readonly<Ref<{ page: number; size: number; total: number }>>
  onPageChange: (p: number) => void
  onSizeChange: (s: number) => void
  reset: () => void
}

/** 统一分页逻辑 */
export function usePagination(defaultSize = 10): PaginationReturn {
  const page = ref<number>(1)
  const size = ref<number>(defaultSize)
  const total = ref<number>(0)

  const pagination = computed<{ page: number; size: number; total: number }>(() => ({
    page: page.value,
    size: size.value,
    total: total.value
  }))

  function onPageChange(p: number): void {
    page.value = p
  }

  function onSizeChange(s: number): void {
    size.value = s
    page.value = 1
  }

  function reset(): void {
    page.value = 1
    total.value = 0
  }

  return {
    page,
    size,
    total,
    pagination,
    onPageChange,
    onSizeChange,
    reset
  }
}
