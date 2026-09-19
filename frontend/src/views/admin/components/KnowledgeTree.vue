<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuestionStore } from '@/stores/question'
import type { KnowledgeNode } from '@/types'

const questionStore = useQuestionStore()

const expandedIds = ref<number[]>([])

function isExpanded(node: KnowledgeNode): boolean {
  return expandedIds.value.includes(node.id)
}

function isSelected(node: KnowledgeNode): boolean {
  return questionStore.selectedNode?.id === node.id
}

function toggleExpand(node: KnowledgeNode): void {
  if (isExpanded(node)) {
    expandedIds.value = expandedIds.value.filter((id) => id !== node.id)
  } else {
    expandedIds.value.push(node.id)
  }
}

function selectNode(node: KnowledgeNode): void {
  questionStore.selectNode(node)
}

function clearSelect(): void {
  questionStore.selectNode(null)
}

function expandAll(): void {
  expandedIds.value = collectIds(questionStore.knowledgeTree)
}

function collapseAll(): void {
  expandedIds.value = []
}

function collectIds(nodes: KnowledgeNode[]): number[] {
  const ids: number[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      ids.push(node.id)
      ids.push(...collectIds(node.children))
    }
  }
  return ids
}

watch(
  () => questionStore.knowledgeTree,
  (tree) => {
    if (tree.length > 0) {
      expandedIds.value = collectIds(tree)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="knowledge-tree">
    <div class="tree-head">
      <span class="tree-title">知识点</span>
      <div class="tree-ops">
        <button class="btn btn-sm btn-ghost" @click="expandAll">展开</button>
        <button class="btn btn-sm btn-ghost" @click="collapseAll">折叠</button>
      </div>
    </div>

    <div v-if="questionStore.knowledgeTree.length === 0" class="empty">
      <div class="d">暂无知识点</div>
    </div>

    <ul class="tree-list">
      <li v-for="module in questionStore.knowledgeTree" :key="module.id" class="tree-node">
        <div class="tree-row" :class="{ active: isSelected(module) }" @click="selectNode(module)">
          <button
            v-if="module.children && module.children.length"
            class="toggle-btn"
            :class="{ expanded: isExpanded(module) }"
            @click.stop="toggleExpand(module)"
          >
            ▶
          </button>
          <span v-else class="toggle-placeholder"></span>
          <span class="node-name">{{ module.name }}</span>
        </div>

        <ul v-if="module.children && isExpanded(module)" class="tree-children">
          <li v-for="point in module.children" :key="point.id" class="tree-node">
            <div class="tree-row" :class="{ active: isSelected(point) }" @click="selectNode(point)">
              <button
                v-if="point.children && point.children.length"
                class="toggle-btn"
                :class="{ expanded: isExpanded(point) }"
                @click.stop="toggleExpand(point)"
              >
                ▶
              </button>
              <span v-else class="toggle-placeholder"></span>
              <span class="node-name">{{ point.name }}</span>
            </div>

            <ul v-if="point.children && isExpanded(point)" class="tree-children">
              <li v-for="leaf in point.children" :key="leaf.id" class="tree-node">
                <div
                  class="tree-row leaf"
                  :class="{ active: isSelected(leaf) }"
                  @click="selectNode(leaf)"
                >
                  <span class="toggle-placeholder"></span>
                  <span class="node-name">{{ leaf.name }}</span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <button class="btn btn-sm btn-ghost clear-btn" @click="clearSelect">清除选中</button>
  </div>
</template>

<style scoped>
.knowledge-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tree-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tree-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
}

.tree-ops {
  display: flex;
  gap: 4px;
}

.tree-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.tree-children {
  list-style: none;
  padding-left: 18px;
  margin: 0;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;
}

.tree-row:hover {
  background: var(--bg);
}

.tree-row.active {
  background: var(--brand-soft);
  color: var(--brand);
}

.tree-row.leaf {
  font-size: 13px;
  color: var(--text-2);
}

.tree-row.leaf.active {
  color: var(--brand);
}

.toggle-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-3);
  transform: rotate(0deg);
  transition: transform 0.15s;
  cursor: pointer;
  background: transparent;
  border: none;
}

.toggle-btn.expanded {
  transform: rotate(90deg);
}

.toggle-placeholder {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-btn {
  margin-top: 12px;
  width: 100%;
}

.empty {
  padding: 24px 0;
  text-align: center;
}

.empty .d {
  font-size: 13px;
  color: var(--text-3);
}
</style>
