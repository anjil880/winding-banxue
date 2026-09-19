<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useQuestionStore } from '@/stores/question'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/admin/PageHeader.vue'
import SearchForm from '@/components/admin/SearchForm.vue'
import DataTable from '@/components/admin/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import KnowledgeTree from './components/KnowledgeTree.vue'
import QuestionModal from './components/QuestionModal.vue'
import type { Question, KnowledgeNode } from '@/types'

const questionStore = useQuestionStore()
const authStore = useAuthStore()

const deleteConfirm = ref<{ visible: boolean; row: Question | null }>({
  visible: false,
  row: null
})

const typeOptions = [
  { value: '', label: '全部题型' },
  { value: 'choice', label: '选择题' },
  { value: 'fill', label: '填空题' },
  { value: 'calculation', label: '计算题' },
  { value: 'answer', label: '解答题' }
]

const difficultyOptions = [
  { value: '', label: '全部难度' },
  { value: 'basic', label: '基础' },
  { value: 'advanced', label: '进阶' },
  { value: 'challenge', label: '挑战' }
]

const typeMap: Record<string, string> = {
  choice: '选择题',
  fill: '填空题',
  calculation: '计算题',
  answer: '解答题'
}

const difficultyMap: Record<string, string> = {
  basic: '基础',
  advanced: '进阶',
  challenge: '挑战'
}

const columns = [
  { key: 'type', title: '题型', width: '100px' },
  { key: 'difficulty', title: '难度', width: '80px' },
  { key: 'knowledge', title: '知识点', width: '160px' },
  { key: 'stem', title: '题干摘要' },
  { key: 'ops', title: '操作', width: '140px', align: 'right' as const }
]

function onSearch(): void {
  questionStore.fetchQuestions()
}

function onReset(): void {
  questionStore.resetFilters()
  questionStore.fetchQuestions()
}

function openCreateModal(): void {
  questionStore.openModal()
}

function openEditModal(row: Question): void {
  questionStore.openModal(row)
}

function openDeleteConfirm(row: Question): void {
  deleteConfirm.value.row = row
  deleteConfirm.value.visible = true
}

async function confirmDelete(): Promise<void> {
  if (!deleteConfirm.value.row) return
  await questionStore.deleteQuestion(deleteConfirm.value.row.id)
  deleteConfirm.value.row = null
  deleteConfirm.value.visible = false
}

function getKnowledgeName(row: Question): string {
  if (!row.knowledgePointId) return '-'
  return findNodeName(questionStore.knowledgeTree, row.knowledgePointId) || '-'
}

function findNodeName(nodes: KnowledgeNode[], id: number): string | null {
  for (const node of nodes) {
    if (node.id === id) return node.name
    if (node.children) {
      const found = findNodeName(node.children, id)
      if (found) return found
    }
  }
  return null
}

function truncate(text: string, len = 40): string {
  return text.length > len ? text.slice(0, len) + '…' : text
}

function asQuestion(row: Record<string, unknown>): Question {
  return row as unknown as Question
}

watch(
  () => questionStore.filters,
  () => {
    questionStore.page = 1
  },
  { deep: true }
)

onMounted(() => {
  questionStore.fetchKnowledgeTree()
  questionStore.fetchQuestions()
})
</script>

<template>
  <PageHeader title="题库管理" subtitle="维护知识点与题目">
    <button class="btn btn-primary" @click="openCreateModal">+ 新增题目</button>
  </PageHeader>

  <div class="question-layout">
    <aside class="question-sidebar">
      <KnowledgeTree />
    </aside>

    <div class="question-main">
      <SearchForm
        v-model:keyword="questionStore.filters.keyword"
        placeholder="搜索题干关键词"
        @search="onSearch"
        @reset="onReset"
      >
        <select v-model="questionStore.filters.type" class="select filter" @change="onSearch">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="questionStore.filters.difficulty" class="select filter" @change="onSearch">
          <option v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </SearchForm>

      <DataTable
        :columns="columns"
        :data="questionStore.list as unknown as Record<string, unknown>[]"
        :loading="questionStore.loading"
        :page="questionStore.page"
        :size="questionStore.size"
        :total="questionStore.total"
        @update:page="questionStore.onPageChange"
        @update:size="questionStore.onSizeChange"
      >
        <template #cell-type="{ row }">
          <span class="tag tag-blue">{{ typeMap[asQuestion(row).type] }}</span>
        </template>
        <template #cell-difficulty="{ row }">
          <span
            class="tag"
            :class="asQuestion(row).difficulty === 'basic' ? 'tag-green' : asQuestion(row).difficulty === 'advanced' ? 'tag-amber' : 'tag-red'"
          >
            {{ difficultyMap[asQuestion(row).difficulty] }}
          </span>
        </template>
        <template #cell-knowledge="{ row }">
          {{ getKnowledgeName(asQuestion(row)) }}
        </template>
        <template #cell-stem="{ row }">
          {{ truncate(asQuestion(row).stem) }}
        </template>
        <template #cell-ops="{ row }">
          <div class="ops">
            <button class="btn btn-sm" @click="openEditModal(asQuestion(row))">编辑</button>
            <button v-if="authStore.isAdmin" class="btn btn-sm btn-danger" @click="openDeleteConfirm(asQuestion(row))">删除</button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>

  <QuestionModal />

  <ConfirmModal
    v-model:visible="deleteConfirm.visible"
    title="删除题目"
    :content="`确认删除该题目吗？删除后不可恢复。`"
    type="danger"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.question-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
}

@media (max-width: 960px) {
  .question-layout {
    grid-template-columns: 1fr;
  }
}

.question-sidebar {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  min-height: 400px;
}

.question-main {
  min-width: 0;
}

.filter {
  min-width: 110px;
}

.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
