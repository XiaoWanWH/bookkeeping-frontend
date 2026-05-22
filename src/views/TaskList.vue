<template>
  <div class="task-list">
    <div class="page-header">
      <div class="header-content">
        <h2>任务列表</h2>
        <p>管理您的所有记账任务</p>
      </div>
      <el-button type="primary" class="create-btn" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建任务
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索任务名称..."
        prefix-icon="Search"
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="sortBy" placeholder="排序方式" class="filter-select">
        <el-option label="按名称" value="name" />
        <el-option label="按日期" value="date" />
        <el-option label="按优先级" value="priority" />
      </el-select>
      <el-select v-model="sortOrder" placeholder="排序顺序" class="filter-select">
        <el-option label="升序" value="asc" />
        <el-option label="降序" value="desc" />
      </el-select>
      <el-button type="primary" @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="resetFilter" class="reset-btn">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>

    <!-- 任务卡片列表 -->
    <div v-loading="loading" class="task-grid">
      <el-card
        v-for="task in taskList"
        :key="task.id"
        shadow="hover"
        class="task-card"
        @click="$router.push(`/tasks/${task.id}`)"
      >
        <div class="task-header">
          <span class="task-name">{{ task.name }}</span>
          <el-tag :type="getPriorityType(task.priority)" size="small" class="priority-tag">
            {{ getPriorityText(task.priority) }}
          </el-tag>
        </div>

        <div class="task-desc" v-if="task.description">
          {{ task.description }}
        </div>

        <div class="task-meta">
          <div class="meta-item">
            <Avatar
              :avatar="task.creator?.avatar"
              :username="task.creator?.username"
              :nickname="task.creator?.nickname"
              :size="28"
            />
            <span class="creator-name">{{ task.creator?.nickname || task.creator?.username }}</span>
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>{{ task.memberCount || 0 }} 成员</span>
          </div>
        </div>

        <div class="task-stats">
          <div class="stat-item">
            <div class="stat-label">收入</div>
            <div class="stat-value income">+{{ formatMoney(task.totalIncome) }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">支出</div>
            <div class="stat-value expense">-{{ formatMoney(task.totalExpense) }}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">余额</div>
            <div class="stat-value" :class="task.balance >= 0 ? 'income' : 'expense'">
              {{ task.balance >= 0 ? '+' : '' }}{{ formatMoney(task.balance) }}
            </div>
          </div>
        </div>

        <!-- 目标进度 -->
        <div v-if="task.targetAmount && task.targetAmount > 0" class="target-section">
          <ProgressCard
            label="目标进度"
            :current-amount="task.balance || 0"
            :target-amount="task.targetAmount"
          />
        </div>

        <!-- 成员目标列表 -->
        <div v-if="task.memberTargets && task.memberTargets.length > 0" class="member-targets">
          <div class="section-title">成员目标</div>
          <div class="member-target-list">
            <div
              v-for="mt in task.memberTargets"
              :key="mt.user?.id"
              class="member-target-item"
            >
              <Avatar
                :avatar="mt.user?.avatar"
                :username="mt.user?.username"
                :nickname="mt.user?.nickname"
                :size="24"
              />
              <span class="member-name">
                {{ mt.user?.nickname || mt.user?.username }}
              </span>
              <ProgressCard
                label=""
                :current-amount="mt.currentAmount || 0"
                :target-amount="mt.targetAmount || 0"
                :stroke-width="8"
                class="member-progress"
              />
            </div>
          </div>
        </div>

        <!-- 修改按钮（仅创建者可见） -->
        <div
          v-if="task.creator && task.creator.id === currentUserId"
          class="edit-section"
          @click.stop
        >
          <el-button type="primary" text size="small" @click.stop="handleEdit(task)" class="edit-btn">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" text size="small" @click.stop="handleDelete(task)" class="delete-btn">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </el-card>

      <el-empty v-if="!loading && taskList.length === 0" description="暂无任务" :image-size="100" class="empty-state" />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="fetchTasks"
      />
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建任务" width="520px" class="custom-dialog">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top" class="dialog-form">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入任务名称" size="large" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="createForm.priority" size="large" style="width: 100%" placeholder="请选择优先级">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number
            v-model="createForm.targetAmount"
            :min="0"
            :precision="2"
            size="large"
            style="width: 100%"
            placeholder="请输入目标金额（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateTask" class="confirm-btn">
          创建任务
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑任务" width="520px" class="custom-dialog">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top" class="dialog-form">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入任务名称" size="large" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="editForm.priority" size="large" style="width: 100%" placeholder="请选择优先级">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number
            v-model="editForm.targetAmount"
            :min="0"
            :precision="2"
            size="large"
            style="width: 100%"
            placeholder="请输入目标金额"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleUpdateTask" class="confirm-btn">
          保存更改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getTaskList, updateTask, createTask, deleteTask } from '@/api/task'
import { useUserStore } from '@/stores/user'
import { formatMoney, getPriorityText, getPriorityType } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import ProgressCard from '@/components/ProgressCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id)

const loading = ref(false)
const taskList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const keyword = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)
const createForm = reactive({
  name: '',
  description: '',
  priority: 2,
  targetAmount: 0
})

const createRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  name: '',
  description: '',
  priority: 2,
  targetAmount: 0
})

const editRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await getTaskList({
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    const data = res.data || res
    taskList.value = data.list || data.content || data.records || []
    total.value = data.total || taskList.value.length
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTasks()
}

const resetFilter = () => {
  keyword.value = ''
  sortBy.value = 'date'
  sortOrder.value = 'desc'
  currentPage.value = 1
  fetchTasks()
}

const handleCreate = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.priority = 2
  createForm.targetAmount = 0
  createDialogVisible.value = true
}

const handleCreateTask = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      await createTask({
        name: createForm.name,
        description: createForm.description,
        priority: createForm.priority,
        targetAmount: createForm.targetAmount || null
      })
      ElMessage.success('🎉 任务创建成功！')
      createDialogVisible.value = false
      fetchTasks()
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      createLoading.value = false
    }
  })
}

const handleEdit = (task) => {
  editForm.id = task.id
  editForm.name = task.name
  editForm.description = task.description || ''
  editForm.priority = task.priority
  editForm.targetAmount = task.targetAmount || 0
  editDialogVisible.value = true
}

const handleUpdateTask = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    editLoading.value = true
    try {
      await updateTask(editForm.id, {
        name: editForm.name,
        description: editForm.description,
        priority: editForm.priority,
        targetAmount: editForm.targetAmount
      })
      ElMessage.success('✓ 任务更新成功！')
      editDialogVisible.value = false
      fetchTasks()
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      editLoading.value = false
    }
  })
}

const handleDelete = async (task) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${task.name}"吗？此操作不可恢复，所有相关数据将被永久删除。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deleteTask(task.id)
    ElMessage.success('✓ 任务已删除')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.task-list {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.create-btn {
  font-weight: 600;
  border-radius: 0.875rem;
  padding: 0.75rem 1.5rem;
  height: auto;
  font-size: 0.9375rem;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.25s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-200);
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 240px;
}

.filter-select {
  width: 140px;
}

.search-btn, .reset-btn {
  font-weight: 600;
  border-radius: 0.75rem;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.task-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 1.5rem;
  border: 1px solid var(--gray-200);
  overflow: hidden;
  position: relative;
}

.task-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-300);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.3px;
  flex: 1;
}

.priority-tag {
  font-weight: 600;
  flex-shrink: 0;
}

.task-desc {
  font-size: 0.9375rem;
  color: var(--gray-500);
  margin-bottom: 1.25rem;
  line-height: 1.6;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.creator-name {
  font-weight: 500;
}

.task-stats {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
  border-radius: 1rem;
  margin-bottom: 1.25rem;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.375rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.stat-value.income {
  color: var(--success-600);
}

.stat-value.expense {
  color: var(--danger-600);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--gray-200);
}

.target-section {
  margin-bottom: 1.25rem;
}

.member-targets {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-target-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-target-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 0.875rem;
  transition: all 0.25s ease;
}

.member-target-item:hover {
  background: var(--primary-50);
}

.member-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-progress {
  flex: 2;
  min-width: 150px;
}

.edit-section {
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-200);
  text-align: right;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn {
  font-weight: 600;
  font-size: 0.875rem;
}

.delete-btn {
  font-weight: 600;
  font-size: 0.875rem;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 4rem 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

.custom-dialog {
  border-radius: 1.5rem;
  overflow: hidden;
}

.dialog-form {
  padding-top: 0.5rem;
}

.cancel-btn, .confirm-btn {
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
}

.confirm-btn {
  background: var(--gradient-primary);
  border: none;
}

@media (max-width: 1024px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input, .filter-select {
    width: 100%;
    max-width: 100%;
  }

  .task-stats {
    flex-wrap: wrap;
    gap: 0;
  }

  .stat-item {
    padding: 0.5rem 0;
  }

  .stat-divider:nth-child(3) {
    display: none;
  }
}
</style>

