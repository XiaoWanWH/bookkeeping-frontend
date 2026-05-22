<template>
  <div class="dashboard">
    <div class="page-header">
      <div class="header-content">
        <h2>仪表盘</h2>
        <p>查看您的财务概览</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" v-loading="loading" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card task-card">
          <div class="stat-icon-wrapper">
            <el-icon class="stat-icon"><List /></el-icon>
          </div>
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card income-card">
          <div class="stat-icon-wrapper">
            <el-icon class="stat-icon"><Top /></el-icon>
          </div>
          <div class="stat-value income">{{ formatMoney(stats.totalIncome) }}</div>
          <div class="stat-label">总收入</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card expense-card">
          <div class="stat-icon-wrapper">
            <el-icon class="stat-icon"><Bottom /></el-icon>
          </div>
          <div class="stat-value expense">{{ formatMoney(stats.totalExpense) }}</div>
          <div class="stat-label">总支出</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card balance-card">
          <div class="stat-icon-wrapper">
            <el-icon class="stat-icon"><Wallet /></el-icon>
          </div>
          <div class="stat-value" :class="stats.totalBalance >= 0 ? 'income' : 'expense'">
            {{ formatMoney(stats.totalBalance) }}
          </div>
          <div class="stat-label">总余额</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近任务 -->
    <el-card shadow="hover" class="recent-tasks-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">最近任务</span>
            <span class="header-subtitle">查看您最近参与的任务</span>
          </div>
          <el-button type="primary" text @click="$router.push('/tasks')" class="view-all-btn">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <el-table :data="recentTasks" stripe style="width: 100%" class="custom-table">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/tasks/${row.id}`)" class="task-link">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="120">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small" class="priority-tag">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" width="100" align="center">
          <template #default="{ row }">
            <div class="member-count">
              <el-icon><User /></el-icon>
              <span>{{ row.memberCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalIncome" label="总收入" width="140" align="right">
          <template #default="{ row }">
            <span class="amount income">+{{ formatMoney(row.totalIncome) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalExpense" label="总支出" width="140" align="right">
          <template #default="{ row }">
            <span class="amount expense">-{{ formatMoney(row.totalExpense) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="140" align="right">
          <template #default="{ row }">
            <span class="amount" :class="row.balance >= 0 ? 'income' : 'expense'">
              {{ row.balance >= 0 ? '+' : '' }}{{ formatMoney(row.balance) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && recentTasks.length === 0" description="暂无任务" :image-size="80" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getTaskList } from '@/api/task'
import { formatMoney, getPriorityText, getPriorityType } from '@/utils/format'

const loading = ref(false)
const stats = reactive({
  totalTasks: 0,
  totalIncome: 0,
  totalExpense: 0,
  totalBalance: 0
})
const recentTasks = ref([])

const fetchDashboard = async () => {
  loading.value = true
  try {
    const res = await getTaskList({ page: 1, size: 5 })
    const data = res.data || res
    recentTasks.value = data.list || data.content || data.records || []

    // 计算统计数据
    const allRes = await getTaskList({ page: 1, size: 1000 })
    const allList = allRes.data?.list || allRes.data?.content || allRes.data?.records || []
    stats.totalTasks = allRes.data?.total || allList.length
    stats.totalIncome = allList.reduce((sum, t) => sum + (t.totalIncome || 0), 0)
    stats.totalExpense = allList.reduce((sum, t) => sum + (t.totalExpense || 0), 0)
    stats.totalBalance = stats.totalIncome - stats.totalExpense
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h2 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.5px;
  margin-bottom: 0.25rem;
}

.header-content p {
  font-size: 1rem;
  color: var(--gray-500);
  font-weight: 500;
}

.stats-row {
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 1.5rem;
  border: 1px solid var(--gray-200);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.task-card::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.income-card::before {
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
}

.expense-card::before {
  background: linear-gradient(90deg, #eb3349 0%, #f45c43 100%);
}

.balance-card::before {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.task-card .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.income-card .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%);
  color: #11998e;
}

.expense-card .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(235, 51, 73, 0.1) 0%, rgba(244, 92, 67, 0.1) 100%);
  color: #eb3349;
}

.balance-card .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
  color: #f093fb;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
  line-height: 1;
  color: var(--gray-900);
}

.stat-value.income {
  color: var(--success-600);
}

.stat-value.expense {
  color: var(--danger-600);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-tasks-card {
  border-radius: 1.5rem;
  border: 1px solid var(--gray-200);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-title {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--gray-900);
}

.header-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 500;
}

.view-all-btn {
  font-weight: 600;
  font-size: 0.9375rem;
}

.custom-table {
  margin-top: 0.5rem;
}

.task-link {
  font-weight: 600;
  color: var(--primary-600);
  font-size: 0.9375rem;
}

.task-link:hover {
  color: var(--primary-700);
}

.priority-tag {
  font-weight: 600;
}

.member-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  color: var(--gray-600);
  font-weight: 600;
}

.amount {
  font-weight: 700;
  font-size: 0.9375rem;
}

.amount.income {
  color: var(--success-600);
}

.amount.expense {
  color: var(--danger-600);
}
</style>

