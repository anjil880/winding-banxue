<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useQuestionStore } from '@/stores/question'
import ModalForm from '@/components/common/ModalForm.vue'
import { required, maxLength } from '@/utils/validation'
import type { QuestionForm, QuestionType, Difficulty, KnowledgeNode } from '@/types'

const questionStore = useQuestionStore()

const form = reactive<QuestionForm>({
  stem: '',
  options: ['', '', '', ''],
  answer: '',
  analysis: '',
  knowledgePointId: undefined,
  type: 'choice',
  difficulty: 'basic'
})

const errors = reactive<Record<string, string>>({
  stem: '',
  answer: '',
  analysis: '',
  knowledgePointId: '',
  type: '',
  difficulty: '',
  option0: '',
  option1: '',
  option2: '',
  option3: ''
})

const submitting = ref<boolean>(false)

const title = computed<string>(() => (questionStore.isEdit ? '编辑题目' : '新增题目'))

const typeOptions: { value: QuestionType; label: string }[] = [
  { value: 'choice', label: '选择题' },
  { value: 'fill', label: '填空题' },
  { value: 'calculation', label: '计算题' },
  { value: 'answer', label: '解答题' }
]

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'basic', label: '基础' },
  { value: 'advanced', label: '进阶' },
  { value: 'challenge', label: '挑战' }
]

function collectLeaves(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const leaves: KnowledgeNode[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      leaves.push(...collectLeaves(node.children))
    } else {
      leaves.push(node)
    }
  }
  return leaves
}

const knowledgeLeaves = computed<KnowledgeNode[]>(() => collectLeaves(questionStore.knowledgeTree))

function resetForm(): void {
  const record = questionStore.current
  const answer = record?.answer
  form.stem = record?.stem || ''
  form.options = record?.options?.length ? [...record.options] : ['', '', '', '']
  form.answer = Array.isArray(answer) ? answer.join(',') : (answer || '')
  form.analysis = record?.analysis || ''
  form.knowledgePointId = record?.knowledgePointId
  form.type = record?.type || 'choice'
  form.difficulty = record?.difficulty || 'basic'
  clearErrors()
}

function clearErrors(): void {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate(): boolean {
  clearErrors()
  let valid = true

  const s = required(form.stem, '题干')
  if (!s.valid) {
    errors.stem = s.message
    valid = false
  } else {
    const ml = maxLength(form.stem, 2000, '题干')
    if (!ml.valid) {
      errors.stem = ml.message
      valid = false
    }
  }

  const a = required(String(form.answer), '答案')
  if (!a.valid) {
    errors.answer = a.message
    valid = false
  }

  if (form.type === 'choice') {
    for (let i = 0; i < form.options.length; i++) {
      const opt = form.options[i]
      const o = required(opt, `选项 ${String.fromCharCode(65 + i)}`)
      if (!o.valid) {
        errors[`option${i}`] = o.message
        valid = false
      }
    }
  }

  if (!form.knowledgePointId) {
    errors.knowledgePointId = '请选择知识点'
    valid = false
  }

  return valid
}

function addOption(): void {
  form.options.push('')
}

function removeOption(index: number): void {
  form.options.splice(index, 1)
}

async function onConfirm(): Promise<void> {
  if (!validate()) return
  submitting.value = true
  try {
    const dto: QuestionForm = {
      ...form,
      answer: form.type === 'choice' ? form.answer : form.answer,
      options: form.type === 'choice' ? form.options : []
    }
    if (questionStore.isEdit && questionStore.current?.id) {
      await questionStore.updateQuestion(questionStore.current.id, dto)
    } else {
      await questionStore.createQuestion(dto)
    }
    questionStore.closeModal()
  } finally {
    submitting.value = false
  }
}

function onCancel(): void {
  questionStore.closeModal()
}

watch(
  () => questionStore.modalVisible,
  (visible) => {
    if (visible) {
      resetForm()
    }
  }
)

onMounted(() => {
  questionStore.fetchKnowledgeTree()
})
</script>

<template>
  <ModalForm
    v-model:visible="questionStore.modalVisible"
    :title="title"
    :loading="submitting"
    width="680px"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="form-grid">
      <div class="form-field">
        <label class="field-label">题型</label>
        <select v-model="form.type" class="select">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="form-field">
        <label class="field-label">难度</label>
        <select v-model="form.difficulty" class="select">
          <option v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="form-field">
        <label class="field-label">知识点</label>
        <select v-model="form.knowledgePointId" class="select" :class="{ err: errors.knowledgePointId }">
          <option :value="undefined">请选择知识点</option>
          <option v-for="leaf in knowledgeLeaves" :key="leaf.id" :value="leaf.id">{{ leaf.name }}</option>
        </select>
        <p v-if="errors.knowledgePointId" class="field-err">{{ errors.knowledgePointId }}</p>
      </div>
    </div>

    <div class="form-field" style="margin-top: 16px">
      <label class="field-label">题干</label>
      <textarea v-model="form.stem" class="input" :class="{ err: errors.stem }" rows="4" placeholder="请输入题干"></textarea>
      <p v-if="errors.stem" class="field-err">{{ errors.stem }}</p>
    </div>

    <div v-if="form.type === 'choice'" class="options-area">
      <label class="field-label">选项</label>
      <div v-for="(_opt, index) in form.options" :key="index" class="option-row">
        <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
        <input v-model="form.options[index]" class="input" :class="{ err: errors[`option${index}`] }" type="text" placeholder="请输入选项内容" />
        <button v-if="form.options.length > 2" class="btn btn-sm btn-ghost" @click="removeOption(index)">删除</button>
      </div>
      <button class="btn btn-sm" style="margin-top: 8px" @click="addOption">+ 添加选项</button>
    </div>

    <div class="form-field" style="margin-top: 16px">
      <label class="field-label">答案</label>
      <input v-model="form.answer" class="input" :class="{ err: errors.answer }" type="text" :placeholder="form.type === 'choice' ? '请输入正确选项字母，如 A' : '请输入答案'" />
      <p v-if="errors.answer" class="field-err">{{ errors.answer }}</p>
    </div>

    <div class="form-field" style="margin-top: 16px">
      <label class="field-label">解析</label>
      <textarea v-model="form.analysis" class="input" rows="3" placeholder="请输入解析（可选）"></textarea>
    </div>
  </ModalForm>
</template>

<style scoped>
.options-area {
  margin-top: 16px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-label {
  width: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-2);
}

.option-row .input {
  flex: 1;
}
</style>
