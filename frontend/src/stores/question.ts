import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import * as questionsApi from '@/api/questions'
import { message } from '@/utils/message'
import type { KnowledgeNode, Question, QuestionForm, QuestionType, Difficulty } from '@/types'

export const useQuestionStore = defineStore('question', () => {
  const knowledgeTree = ref<KnowledgeNode[]>([])
  const selectedNode = ref<KnowledgeNode | null>(null)
  const list = ref<Question[]>([])
  const loading = ref<boolean>(false)
  const { page, size, total, pagination, onPageChange, onSizeChange, reset: resetPagination } = usePagination()

  const filters = ref<{
    keyword: string
    type: QuestionType | ''
    difficulty: Difficulty | ''
    tagged: '' | 'tagged' | 'untagged'
  }>({
    keyword: '',
    type: '',
    difficulty: '',
    tagged: ''
  })

  const current = ref<Question | null>(null)
  const modalVisible = ref<boolean>(false)

  const isEdit = computed<boolean>(() => !!current.value?.id)

  async function fetchKnowledgeTree(): Promise<void> {
    knowledgeTree.value = await questionsApi.getKnowledgeTree()
  }

  async function fetchQuestions(): Promise<void> {
    loading.value = true
    try {
      const res = await questionsApi.getQuestions({
        page: page.value,
        size: size.value,
        keyword: filters.value.keyword,
        type: filters.value.type,
        difficulty: filters.value.difficulty,
        knowledgePointId: selectedNode.value?.level === 3 ? selectedNode.value.id : undefined
      })
      let pageList = res.list
      if (filters.value.tagged === 'tagged') {
        pageList = pageList.filter((q) => q.tagged)
      } else if (filters.value.tagged === 'untagged') {
        pageList = pageList.filter((q) => !q.tagged)
      }
      list.value = pageList
      total.value = res.total
      page.value = res.page
      size.value = res.size
    } finally {
      loading.value = false
    }
  }

  async function createQuestion(dto: QuestionForm): Promise<void> {
    await questionsApi.createQuestion(dto)
    message.success('题目创建成功')
    await fetchQuestions()
  }

  async function updateQuestion(id: number, dto: QuestionForm): Promise<void> {
    await questionsApi.updateQuestion(id, dto)
    message.success('题目更新成功')
    await fetchQuestions()
  }

  async function deleteQuestion(id: number): Promise<void> {
    await questionsApi.deleteQuestion(id)
    message.success('题目已删除')
    await fetchQuestions()
  }

  function selectNode(node: KnowledgeNode | null): void {
    selectedNode.value = node
    resetPagination()
    fetchQuestions()
  }

  function openModal(record?: Question): void {
    current.value = record || null
    modalVisible.value = true
  }

  function closeModal(): void {
    modalVisible.value = false
    current.value = null
  }

  function resetFilters(): void {
    filters.value = { keyword: '', type: '', difficulty: '', tagged: '' }
    selectedNode.value = null
    resetPagination()
  }

  return {
    knowledgeTree,
    selectedNode,
    list,
    loading,
    page,
    size,
    total,
    pagination,
    filters,
    current,
    modalVisible,
    isEdit,
    fetchKnowledgeTree,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    selectNode,
    openModal,
    closeModal,
    resetFilters,
    onPageChange,
    onSizeChange
  }
})
