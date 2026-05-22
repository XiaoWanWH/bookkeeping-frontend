<template>
  <div class="progress-card">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-percent">{{ percent }}%</span>
    </div>
    <el-progress
      :percentage="percent"
      :color="progressColor"
      :stroke-width="strokeWidth"
      :show-text="false"
    />
    <div class="progress-info" v-if="showAmount">
      <span class="current-amount">{{ formatMoney(currentAmount) }}</span>
      <span class="separator">/</span>
      <span class="target-amount">{{ formatMoney(targetAmount) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/format'

const props = defineProps({
  /** 标签文字 */
  label: {
    type: String,
    default: '目标进度'
  },
  /** 当前金额 */
  currentAmount: {
    type: Number,
    default: 0
  },
  /** 目标金额 */
  targetAmount: {
    type: Number,
    default: 0
  },
  /** 进度条粗细 */
  strokeWidth: {
    type: Number,
    default: 12
  },
  /** 是否显示金额 */
  showAmount: {
    type: Boolean,
    default: true
  }
})

const percent = computed(() => {
  if (!props.targetAmount || props.targetAmount <= 0) return 0
  const p = Math.round((props.currentAmount / props.targetAmount) * 100)
  return Math.min(p, 100)
})

const progressColor = computed(() => {
  if (percent.value >= 100) return '#67c23a'
  if (percent.value >= 70) return '#409eff'
  if (percent.value >= 40) return '#e6a23c'
  return '#f56c6c'
})
</script>

<style scoped>
.progress-card {
  padding: 4px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.progress-percent {
  font-size: 14px;
  color: #409eff;
  font-weight: 600;
}

.progress-info {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.current-amount {
  font-weight: 600;
  color: #303133;
}

.separator {
  margin: 0 4px;
}

.target-amount {
  color: #909399;
}
</style>
