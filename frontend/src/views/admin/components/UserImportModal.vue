<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import ModalForm from '@/components/common/ModalForm.vue'

const userStore = useUserStore()

const file = ref<File | null>(null)
const fileName = ref<string>('')
const importing = ref<boolean>(false)
const result = ref<{ imported: number; errors: number; errorList: Array<{ row: number; field: string; message: string }> } | null>(null)

const hasResult = computed<boolean>(() => result.value !== null)
const errorList = computed<Array<{ row: number; field: string; message: string }>>(() => result.value?.errorList || [])

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const selected = target.files?.[0]
  if (selected) {
    file.value = selected
    fileName.value = selected.name
    result.value = null
  }
}

function clearFile(): void {
  file.value = null
  fileName.value = ''
  result.value = null
}

async function onConfirm(): Promise<void> {
  if (!file.value) {
    return
  }
  importing.value = true
  try {
    const res = await userStore.importUsers(file.value)
    result.value = {
      imported: res.imported,
      errors: res.errors?.length || 0,
      errorList: res.errors || []
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '导入失败'
    result.value = {
      imported: 0,
      errors: 1,
      errorList: [{ row: 0, field: '-', message: msg }]
    }
  } finally {
    importing.value = false
  }
}

function onCancel(): void {
  userStore.closeImportModal()
  clearFile()
}

function downloadTemplate(): void {
  const headers = 'role,username,password,name,phone,email,studentNo,employeeNo\n'
  const sample = 'student,zhangsan,123456,张三,13800138000,zhangsan@example.com,S001,\n'
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '用户导入模板.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <ModalForm
    v-model:visible="userStore.importModalVisible"
    title="批量导入用户"
    :loading="importing"
    confirm-text="开始导入"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div v-if="!hasResult" class="import-body">
      <p class="muted" style="margin-bottom: 12px">请上传 CSV 文件，文件首行需包含字段名。</p>
      <div class="template-row">
        <span class="muted">下载导入模板：</span>
        <button class="btn btn-sm" @click="downloadTemplate">下载 CSV 模板</button>
      </div>

      <div class="upload-area">
        <input id="user-import-file" type="file" accept=".csv" @change="onFileChange" />
        <label for="user-import-file" class="upload-label">
          <span v-if="!fileName">点击选择 CSV 文件</span>
          <span v-else>{{ fileName }}</span>
        </label>
        <button v-if="fileName" class="btn btn-sm btn-ghost" @click="clearFile">清除</button>
      </div>
    </div>

    <div v-else class="result-body">
      <div class="result-summary">
        <p>导入完成：成功 <strong>{{ result?.imported }}</strong> 条，失败 <strong>{{ result?.errors }}</strong> 条。</p>
      </div>
      <div v-if="errorList.length > 0" class="result-errors">
        <p class="field-label">失败明细</p>
        <ul>
          <li v-for="(err, index) in errorList" :key="index">第 {{ err.row }} 行 {{ err.field }}：{{ err.message }}</li>
        </ul>
      </div>
    </div>
  </ModalForm>
</template>

<style scoped>
.import-body {
  font-size: 14px;
}

.template-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--bg);
}

.upload-area input[type='file'] {
  display: none;
}

.upload-label {
  flex: 1;
  color: var(--text-2);
  cursor: pointer;
  font-size: 14px;
}

.result-summary {
  padding: 14px;
  background: var(--brand-soft);
  border-radius: var(--radius-sm);
  color: var(--text);
  margin-bottom: 16px;
}

.result-errors {
  max-height: 200px;
  overflow-y: auto;
  background: #fbeaea;
  border: 1px solid #f2c9c9;
  border-radius: var(--radius-sm);
  padding: 12px;
}

.result-errors ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--danger);
}

.result-errors li {
  margin-bottom: 4px;
}
</style>
