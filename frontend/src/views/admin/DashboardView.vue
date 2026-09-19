<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'

interface StatCard {
  label: string
  value: number
  change: string
  color: 'green' | 'blue' | 'amber' | 'red'
}

const stats = ref<StatCard[]>([
  { label: '用户总数', value: 128, change: '+12%', color: 'green' },
  { label: '班级总数', value: 16, change: '+2', color: 'blue' },
  { label: '题目总数', value: 3420, change: '+156', color: 'amber' },
  { label: '今日活跃学生', value: 86, change: '+8', color: 'red' }
])

const recentActivities = ref<string[]>([
  '管理员 admin 重置了 3 位学生的密码',
  '李老师创建了「六年级冲刺班」',
  '教研组录入了 12 道行程问题',
  '系统导入了 45 名新学生'
])

onMounted(() => {
  // Dashboard 真实数据后续对接 /dashboard/stats
})
</script>

<template>
  <PageHeader title="数据总览" subtitle="机构本月经营概况" />

  <div class="stat-grid">
    <div v-for="(item, index) in stats" :key="index" class="stat-card">
      <div class="stat-label">{{ item.label }}</div>
      <div class="stat-value">{{ item.value }}</div>
      <div class="stat-change" :class="item.color">较上月 {{ item.change }}</div>
    </div>
  </div>

  <div class="page-section">
    <div class="card">
      <div class="card-title">
        AI 学情简报
        <span class="tag tag-blue">AI 生成</span>
      </div>
      <div class="brief-body">
        <p>本周机构整体学习活跃度稳定，六年级学生在「行程问题」知识点上正确率提升 12%。</p>
        <p>建议关注五年级「分数乘除法」薄弱点，可针对性推送练习。</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="card">
      <div class="card-title">最近动态</div>
      <ul class="activity-list">
        <li v-for="(act, index) in recentActivities" :key="index" class="activity-item">
          <span class="activity-dot"></span>
          <span>{{ act }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1080px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
}

.stat-change.green {
  color: var(--success);
}
.stat-change.blue {
  color: var(--blue);
}
.stat-change.amber {
  color: var(--warning);
}
.stat-change.red {
  color: var(--danger);
}

.brief-body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.8;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
}
</style>
