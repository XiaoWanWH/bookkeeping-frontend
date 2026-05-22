<template>
  <div class="task-detail" v-loading="loading">
    <!-- 任务基本信息 -->
    <el-card class="task-header-card" shadow="hover">
      <template #header>
        <div class="task-header-top">
          <div class="task-title-group">
            <h2 class="task-title">{{ task.name }}</h2>
            <el-tag :type="getPriorityType(task.priority)" size="small" class="priority-tag">
              {{ getPriorityText(task.priority) }}
            </el-tag>
          </div>
          <div class="task-actions">
            <el-button
              v-if="task.creatorId === currentUserId"
              type="primary"
              size="small"
              @click="openEditTaskDialog"
              class="btn-edit"
            >
              <el-icon><Edit /></el-icon>
              编辑任务
            </el-button>
            <el-button
              v-if="task.creatorId === currentUserId"
              type="danger"
              size="small"
              @click="handleDeleteTask"
              class="btn-delete"
            >
              <el-icon><Delete /></el-icon>
              删除任务
            </el-button>
            <el-button text @click="$router.push('/tasks')" class="btn-back">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border class="task-info-desc">
        <el-descriptions-item label="任务描述" :span="2">
          {{ task.description || '暂无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建者">
          <div class="creator-info">
            <Avatar
              :avatar="task.creator?.avatar"
              :username="task.creator?.username"
              :nickname="task.creator?.nickname"
              :size="28"
            />
            <span class="creator-name">{{ task.creator?.nickname || task.creator?.username }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(task.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-income">
          <div class="stat-value">{{ formatMoney(task.totalIncome) }}</div>
          <div class="stat-label">总收入</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-expense">
          <div class="stat-value">{{ formatMoney(task.totalExpense) }}</div>
          <div class="stat-label">总支出</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-balance" :class="{ 'balance-negative': task.balance < 0 }">
          <div class="stat-value">{{ formatMoney(task.balance) }}</div>
          <div class="stat-label">余额</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-members">
          <div class="stat-value">{{ task.memberCount || 0 }}</div>
          <div class="stat-label">成员数</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 目标进度 -->
    <el-card v-if="task.targetAmount && task.targetAmount > 0" shadow="hover" class="target-card">
      <template #header>
        <div class="target-header">
          <span class="target-title">目标进度</span>
          <el-button
            v-if="task.creatorId === currentUserId"
            type="primary"
            size="small"
            @click="openSetMemberTargetDialog"
            class="btn-set-target"
          >
            <el-icon><Setting /></el-icon>
            设置成员目标
          </el-button>
        </div>
      </template>
      <ProgressCard
        label="总目标"
        :current-amount="task.balance || 0"
        :target-amount="task.targetAmount"
        :stroke-width="16"
        class="overall-progress"
      />

      <!-- 成员目标 -->
      <div v-if="task.memberTargets && task.memberTargets.length > 0" class="member-targets-section">
        <div class="member-targets-title">
          成员目标
        </div>
        <div
          v-for="mt in task.memberTargets"
          :key="mt.user?.id"
          class="member-target-item"
        >
          <Avatar
            :avatar="mt.user?.avatar"
            :username="mt.user?.username"
            :nickname="mt.user?.nickname"
            :size="28"
          />
          <span class="member-name">
            {{ mt.user?.nickname || mt.user?.username }}
          </span>
          <ProgressCard
            label=""
            :current-amount="mt.currentAmount || 0"
            :target-amount="mt.targetAmount || 0"
            :stroke-width="10"
            class="member-progress"
          />
          <div class="member-target-actions">
            <el-button
              v-if="task.creatorId === currentUserId"
              type="primary"
              text
              size="small"
              @click="openEditMemberTargetDialog(mt)"
              class="btn-edit-member"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="task.creatorId === currentUserId"
              type="danger"
              text
              size="small"
              @click="handleDeleteMemberTarget(mt.user.id)"
              class="btn-delete-member"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="content-row">
      <!-- 左侧：收支记录 -->
      <el-col :xs="24" :sm="16">
        <el-card shadow="hover" class="records-card">
          <template #header>
            <div class="records-header">
              <span class="records-title">收支记录</span>
              <el-button type="primary" @click="openAddRecordDialog" class="btn-add-record">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>
          </template>

          <!-- 筛选条件 -->
          <div class="filter-bar">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="fetchRecords"
              class="date-picker"
            />
            <el-select
              v-model="filterRecorderId"
              placeholder="筛选记录人"
              clearable
              class="member-select"
              @change="fetchRecords"
            >
              <el-option
                v-for="member in members"
                :key="member.id"
                :label="member.nickname || member.username"
                :value="member.id"
              />
            </el-select>
          </div>

          <!-- 筛选后统计 -->
          <div v-if="!recordsLoading && records.length > 0" class="filtered-stats">
            <div class="filtered-stat-item">
              <span class="stat-item-label">筛选后收入</span>
              <div class="stat-item-value income">
                +{{ formatMoney(filteredTotalIncome) }}
              </div>
            </div>
            <div class="filtered-stat-item">
              <span class="stat-item-label">筛选后支出</span>
              <div class="stat-item-value expense">
                -{{ formatMoney(filteredTotalExpense) }}
              </div>
            </div>
            <div class="filtered-stat-item">
              <span class="stat-item-label">筛选后余额</span>
              <div class="stat-item-value" :class="filteredBalance >= 0 ? 'income' : 'expense'">
                {{ filteredBalance >= 0 ? '+' : '' }}{{ formatMoney(filteredBalance) }}
              </div>
            </div>
          </div>

          <!-- 记录列表 -->
          <div v-loading="recordsLoading" class="records-list">
            <div v-for="record in records" :key="record.id" class="record-item">
              <el-tag :type="record.type === 'INCOME' ? 'success' : 'danger'" size="small" class="record-type-tag">
                {{ record.type === 'INCOME' ? '收入' : '支出' }}
              </el-tag>
              <div class="record-info">
                <div class="record-desc">{{ record.description || '无描述' }}</div>
                <div class="record-meta">
                  <span class="record-date">{{ formatDate(record.recordDate || record.createTime, 'YYYY-MM-DD') }}</span>
                  <div class="record-user">
                    <Avatar
                      :avatar="record.user?.avatar"
                      :username="record.user?.username"
                      :nickname="record.user?.nickname"
                      :size="18"
                    />
                    <span class="user-name">{{ record.user?.nickname || record.user?.username }}</span>
                  </div>
                </div>
                <!-- 附件展示 -->
                <div v-if="record.attachments && record.attachments.length > 0" class="attachment-list">
                  <div
                    v-for="file in record.attachments"
                    :key="file.id"
                    class="attachment-thumb"
                    @click="handlePreviewFile(file)"
                  >
                    <img
                      v-if="isImageFile(file)"
                      :src="file.fileUrl || `/api/files/${file.id}`"
                      alt="附件"
                    />
                    <el-icon v-else class="file-icon"><Document /></el-icon>
                  </div>
                </div>
              </div>
              <div
                class="record-amount"
                :class="record.type === 'INCOME' ? 'income' : 'expense'"
              >
                {{ record.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(record.amount) }}
              </div>
              <el-button
                type="danger"
                text
                size="small"
                class="btn-delete-record"
                @click="handleDeleteRecord(record.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <el-empty v-if="!recordsLoading && records.length === 0" description="暂无记录" class="empty-records" />
          </div>

          <!-- 分页 -->
          <div class="pagination-container" v-if="recordsTotal > recordsPageSize">
            <el-pagination
              v-model:current-page="recordsCurrentPage"
              :page-size="recordsPageSize"
              :total="recordsTotal"
              layout="prev, pager, next"
              background
              @current-change="fetchRecords"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：成员列表和邀请 -->
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="members-card">
          <template #header>
            <span class="members-title">成员列表</span>
          </template>
          <div class="members-list">
            <div v-for="member in members" :key="member.id" class="member-item">
              <Avatar
                :avatar="member.avatar"
                :username="member.username"
                :nickname="member.nickname"
                :size="32"
              />
              <span class="member-name">
                {{ member.nickname || member.username }}
              </span>
              <el-tag v-if="member.id === task.creatorId" type="warning" size="small" class="creator-tag">
                创建者
              </el-tag>
              <el-button
                v-if="task.creatorId === currentUserId && member.id !== currentUserId"
                type="danger"
                text
                size="small"
                @click="handleRemoveMember(member.id)"
                class="btn-remove-member"
              >
                移除
              </el-button>
            </div>
          </div>
          <el-empty v-if="members.length === 0" description="暂无成员" :image-size="60" class="empty-members" />
        </el-card>

        <!-- 邀请成员 - 仅创建者可见 -->
        <el-card v-if="task.creatorId === currentUserId" shadow="hover" class="invite-card">
          <template #header>
            <span class="invite-title">邀请成员</span>
          </template>
          <el-form @submit.prevent="handleInviteMember" class="invite-form">
            <el-form-item class="invite-input-item">
              <el-input
                v-model="inviteUsername"
                placeholder="输入用户名邀请"
                prefix-icon="User"
                class="invite-input"
              />
            </el-form-item>
            <el-form-item class="invite-btn-item">
              <el-button
                type="primary"
                :loading="inviteLoading"
                @click="handleInviteMember"
                class="btn-invite"
              >
                <el-icon><Promotion /></el-icon>
                发送邀请
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加收支记录对话框 -->
    <el-dialog v-model="recordDialogVisible" title="添加收支记录" width="520px">
      <el-form ref="recordFormRef" :model="recordForm" :rules="recordRules" label-position="top">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="recordForm.type">
            <el-radio-button value="INCOME">收入</el-radio-button>
            <el-radio-button value="EXPENSE">支出</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="recordForm.amount"
            :min="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="请输入金额"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="recordForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :multiple="true"
            :file-list="recordForm.fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div style="font-size: 12px; color: #909399; margin-top: 4px">
                支持上传多个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="recordLoading" @click="handleAddRecord">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="editTaskDialogVisible" title="编辑任务" width="520px">
      <el-form ref="editTaskFormRef" :model="editTaskForm" :rules="editTaskRules" label-position="top">
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="editTaskForm.name"
            placeholder="请输入任务名称"
          />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="editTaskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="editTaskForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number
            v-model="editTaskForm.targetAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入目标金额，不设置可留空"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editTaskLoading" @click="handleEditTask">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 设置/编辑成员目标对话框 -->
    <el-dialog v-model="memberTargetDialogVisible" :title="isEditingMemberTarget ? '编辑成员目标' : '设置成员目标'" width="520px">
      <el-form ref="memberTargetFormRef" :model="memberTargetForm" label-position="top">
        <el-form-item label="选择成员" prop="userId">
          <el-select v-model="memberTargetForm.userId" placeholder="请选择成员" style="width: 100%" :disabled="isEditingMemberTarget">
            <el-option
              v-for="member in members"
              :key="member.id"
              :label="member.nickname || member.username"
              :value="member.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number
            v-model="memberTargetForm.targetAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入目标金额"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="memberTargetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="memberTargetLoading" @click="handleSetMemberTarget">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewVisible" title="文件预览" width="600px">
      <div style="text-align: center">
        <img
          v-if="previewFile && isImageFile(previewFile)"
          :src="previewFile.fileUrl || `/api/files/${previewFile.id}`"
          style="max-width: 100%; max-height: 500px"
          alt="预览"
        />
        <div v-else>
          <el-icon style="font-size: 60px; color: #909399"><Document /></el-icon>
          <p style="margin-top: 12px; color: #606266">{{ previewFile?.fileName || previewFile?.originalName || '文件' }}</p>
          <el-button type="primary" @click="handleDownloadFile">
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTaskDetail, deleteTask, updateTask } from '@/api/task'
import { getMembers, removeMember, inviteMember } from '@/api/member'
import { getRecords, addRecord, deleteRecord } from '@/api/record'
import { uploadFiles } from '@/api/file'
import { setMemberTarget, deleteMemberTarget } from '@/api/member-target'
import { useUserStore } from '@/stores/user'
import { formatMoney, formatDate, getPriorityText, getPriorityType } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import ProgressCard from '@/components/ProgressCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id)

const loading = ref(false)
const task = ref({})
const members = ref([])

// 记录相关
const records = ref([])
const recordsLoading = ref(false)
const recordsCurrentPage = ref(1)
const recordsPageSize = ref(20)
const recordsTotal = ref(0)
const dateRange = ref(null)
const filterRecorderId = ref(null)

// 添加记录对话框
const recordDialogVisible = ref(false)
const recordLoading = ref(false)
const recordFormRef = ref(null)
const uploadRef = ref(null)
const recordForm = reactive({
  type: 'INCOME',
  amount: null,
  description: '',
  date: '',
  fileList: []
})

const recordRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

// 编辑任务对话框
const editTaskDialogVisible = ref(false)
const editTaskLoading = ref(false)
const editTaskFormRef = ref(null)
const editTaskForm = reactive({
  name: '',
  description: '',
  priority: 2,
  targetAmount: null
})

const editTaskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

// 成员目标相关
const memberTargetDialogVisible = ref(false)
const memberTargetLoading = ref(false)
const memberTargetFormRef = ref(null)
const isEditingMemberTarget = ref(false)
const memberTargetForm = reactive({
  userId: null,
  targetAmount: null
})

// 邀请相关
const inviteUsername = ref('')
const inviteLoading = ref(false)

// 文件预览
const previewVisible = ref(false)
const previewFile = ref(null)

const isImageFile = (file) => {
  if (!file) return false
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const fileName = file.fileName || file.originalName || file.name || ''
  const ext = fileName.split('.').pop().toLowerCase()
  return imageTypes.includes(ext)
}

// 筛选后统计计算
const filteredTotalIncome = computed(() => {
  return records.value
    .filter(r => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0)
})

const filteredTotalExpense = computed(() => {
  return records.value
    .filter(r => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0)
})

const filteredBalance = computed(() => {
  return filteredTotalIncome.value - filteredTotalExpense.value
})

const fetchTaskDetail = async () => {
  loading.value = true
  try {
    const res = await getTaskDetail(route.params.id)
    task.value = res.data || res
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const fetchMembers = async () => {
  try {
    const res = await getMembers(route.params.id)
    members.value = res.data || res || []
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

const fetchRecords = async () => {
  recordsLoading.value = true
  try {
    const params = {
      taskId: route.params.id,
      page: recordsCurrentPage.value,
      size: recordsPageSize.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    if (filterRecorderId.value) {
      params.userId = filterRecorderId.value
    }
    const res = await getRecords(params)
    const data = res.data || res
    records.value = data.list || data.content || data.records || []
    recordsTotal.value = data.total || records.value.length
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    recordsLoading.value = false
  }
}

const openAddRecordDialog = () => {
  recordForm.type = 'INCOME'
  recordForm.amount = null
  recordForm.description = ''
  recordForm.date = new Date().toISOString().split('T')[0]
  recordForm.fileList = []
  recordDialogVisible.value = true
}

const openEditTaskDialog = () => {
  editTaskForm.name = task.value.name || ''
  editTaskForm.description = task.value.description || ''
  editTaskForm.priority = task.value.priority || 2
  editTaskForm.targetAmount = task.value.targetAmount || null
  editTaskDialogVisible.value = true
}

const handleEditTask = async () => {
  if (!editTaskFormRef.value) return
  await editTaskFormRef.value.validate(async (valid) => {
    if (!valid) return
    editTaskLoading.value = true
    try {
      await updateTask(route.params.id, {
        name: editTaskForm.name,
        description: editTaskForm.description,
        priority: editTaskForm.priority,
        targetAmount: editTaskForm.targetAmount
      })
      ElMessage.success('保存成功')
      editTaskDialogVisible.value = false
      fetchTaskDetail()
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      editTaskLoading.value = false
    }
  })
}

const handleDeleteTask = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${task.value.name}"吗？此操作不可恢复，所有相关数据将被永久删除。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deleteTask(route.params.id)
    ElMessage.success('✓ 任务已删除')
    router.push('/tasks')
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

const openSetMemberTargetDialog = () => {
  isEditingMemberTarget.value = false
  memberTargetForm.userId = null
  memberTargetForm.targetAmount = null
  memberTargetDialogVisible.value = true
}

const openEditMemberTargetDialog = (memberTarget) => {
  isEditingMemberTarget.value = true
  memberTargetForm.userId = memberTarget.user.id
  memberTargetForm.targetAmount = memberTarget.targetAmount
  memberTargetDialogVisible.value = true
}

const handleSetMemberTarget = async () => {
  if (!memberTargetForm.userId || !memberTargetForm.targetAmount) {
    ElMessage.warning('请填写完整信息')
    return
  }
  memberTargetLoading.value = true
  try {
    await setMemberTarget(route.params.id, {
      userId: memberTargetForm.userId,
      targetAmount: memberTargetForm.targetAmount
    })
    ElMessage.success('设置成功')
    memberTargetDialogVisible.value = false
    fetchTaskDetail()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    memberTargetLoading.value = false
  }
}

const handleDeleteMemberTarget = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该成员目标吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteMemberTarget(route.params.id, userId)
    ElMessage.success('删除成功')
    fetchTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

const handleFileChange = (file, fileList) => {
  recordForm.fileList = fileList
}

const handleFileRemove = (file, fileList) => {
  recordForm.fileList = fileList
}

const handleAddRecord = async () => {
  if (!recordFormRef.value) return
  await recordFormRef.value.validate(async (valid) => {
    if (!valid) return
    recordLoading.value = true
    try {
      let attachmentIds = []
      if (recordForm.fileList.length > 0) {
        const formData = new FormData()
        recordForm.fileList.forEach((f) => {
          formData.append('files', f.raw)
        })
        const uploadRes = await uploadFiles(formData)
        const uploadedFiles = uploadRes.data || uploadRes
        attachmentIds = uploadedFiles.map((f) => f.id)
      }

      await addRecord({
        taskId: route.params.id,
        type: recordForm.type === 'INCOME' ? 1 : 2,
        amount: recordForm.amount,
        description: recordForm.description,
        recordDate: recordForm.date,
        attachmentIds: attachmentIds
      })

      ElMessage.success('添加成功')
      recordDialogVisible.value = false
      recordForm.fileList = []
      fetchRecords()
      fetchTaskDetail()
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      recordLoading.value = false
    }
  })
}

const handleDeleteRecord = async (recordId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRecord(recordId)
    ElMessage.success('删除成功')
    fetchRecords()
    fetchTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

const handleInviteMember = async () => {
  if (!inviteUsername.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  inviteLoading.value = true
  try {
    await inviteMember(route.params.id, { inviteUsername: inviteUsername.value.trim() })
    ElMessage.success('邀请已发送')
    inviteUsername.value = ''
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    inviteLoading.value = false
  }
}

const handleRemoveMember = async (memberId) => {
  try {
    await ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeMember(route.params.id, memberId)
    ElMessage.success('移除成功')
    fetchMembers()
    fetchTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

const handlePreviewFile = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

const handleDownloadFile = () => {
  if (previewFile.value) {
    const url = previewFile.value.fileUrl || `/api/files/${previewFile.value.id}`
    window.open(url, '_blank')
  }
}

onMounted(() => {
    fetchTaskDetail()
    fetchMembers()
    fetchRecords()
  })
</script>

<style scoped>
.task-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 任务头部卡片 */
.task-header-card {
  margin-bottom: 0;
}

.task-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.task-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.5px;
}

.priority-tag {
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-edit, .btn-back, .btn-delete {
  border-radius: var(--radius-lg);
  font-weight: 500;
}

.btn-delete {
  background: var(--gradient-danger);
  border: none;
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.task-info-desc {
  margin-top: var(--spacing-sm);
}

.creator-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.creator-name {
  font-weight: 500;
  color: var(--gray-800);
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 0;
}

.stat-card {
  position: relative;
  overflow: hidden;
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

.stat-income::before {
  background: var(--gradient-success);
}

.stat-expense::before {
  background: var(--gradient-danger);
}

.stat-balance::before {
  background: var(--gradient-warning);
}

.stat-members::before {
  background: var(--gradient-primary);
}

.stat-card .stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
  line-height: 1.2;
  letter-spacing: -1px;
  color: var(--primary-600);
}

.stat-income .stat-value {
  color: var(--success-600);
}

.stat-expense .stat-value {
  color: var(--danger-600);
}

.stat-balance .stat-value {
  color: var(--success-600);
}

.stat-balance.balance-negative .stat-value {
  color: var(--danger-600);
}

.stat-members .stat-value {
  color: var(--warning-600);
}

.stat-card .stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 目标进度卡片 */
.target-card {
  margin-bottom: 0;
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-title {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.btn-set-target {
  border-radius: var(--radius-lg);
  font-weight: 500;
}

.overall-progress {
  margin-bottom: var(--spacing-md);
}

.member-targets-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.member-targets-title {
  font-size: var(--font-size-sm);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-target-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  transition: var(--transition);
}

.member-target-item:hover {
  background: var(--primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.member-target-item:last-child {
  margin-bottom: 0;
}

.member-name {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-800);
  flex: 1;
  min-width: 80px;
}

.member-progress {
  flex: 2;
}

.member-target-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-sm);
}

.btn-edit-member, .btn-delete-member {
  border-radius: var(--radius-lg);
}

/* 内容行 */
.content-row {
  margin-top: 0;
}

/* 记录卡片 */
.records-card {
  margin-bottom: 0;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.records-title {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.btn-add-record {
  border-radius: var(--radius-lg);
  font-weight: 500;
}

.filter-bar .date-picker,
.filter-bar .member-select {
  border-radius: var(--radius-lg);
}

.member-select {
  width: 160px;
}

/* 筛选后统计 */
.filtered-stats {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
  border-radius: var(--radius-xl);
  display: flex;
  gap: var(--spacing-xl);
}

.filtered-stat-item {
  flex: 1;
}

.stat-item-label {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.stat-item-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  line-height: 1.3;
}

.stat-item-value.income {
  color: var(--success-600);
}

.stat-item-value.expense {
  color: var(--danger-600);
}

/* 记录列表 */
.records-list {
  margin-bottom: var(--spacing-sm);
}

.record-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-sm);
  background: white;
  border: 1px solid var(--gray-200);
  transition: var(--transition);
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-200);
}

.record-type-tag {
  flex-shrink: 0;
  margin-top: 2px;
  font-weight: 600;
}

.record-info {
  flex: 1;
  margin-left: var(--spacing-md);
  min-width: 0;
}

.record-desc {
  font-size: var(--font-size-md);
  color: var(--gray-800);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.record-meta {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.record-date {
  font-weight: 500;
}

.record-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.user-name {
  font-size: var(--font-size-sm);
}

.record-amount {
  font-size: var(--font-size-xl);
  font-weight: 800;
  margin-left: var(--spacing-md);
  letter-spacing: -0.5px;
  flex-shrink: 0;
}

.record-amount.income {
  color: var(--success-600);
}

.record-amount.expense {
  color: var(--danger-600);
}

.btn-delete-record {
  margin-left: var(--spacing-sm);
  border-radius: var(--radius-lg);
}

.empty-records {
  padding: var(--spacing-xl) 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-md);
}

/* 成员卡片 */
.members-card {
  margin-bottom: var(--spacing-lg);
}

.members-title {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.member-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  transition: var(--transition);
}

.member-item:hover {
  background: var(--primary-50);
  transform: translateX(4px);
}

.member-item .member-name {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  flex: 1;
  min-width: 0;
}

.creator-tag {
  font-weight: 600;
  margin-right: var(--spacing-xs);
}

.btn-remove-member {
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.empty-members {
  padding: var(--spacing-xl) 0;
}

/* 邀请卡片 */
.invite-card {
  margin-bottom: 0;
}

.invite-title {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.invite-form {
  margin-bottom: 0;
}

.invite-input-item {
  margin-bottom: var(--spacing-md);
}

.invite-input {
  border-radius: var(--radius-lg);
}

.invite-btn-item {
  margin-bottom: 0;
}

.btn-invite {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--font-size-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .task-title-group {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .task-title {
    font-size: var(--font-size-xl);
  }

  .task-actions {
    width: 100%;
  }

  .task-actions .el-button {
    flex: 1;
  }

  .stats-row .el-col {
    margin-bottom: var(--spacing-md);
  }

  .target-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .btn-set-target {
    width: 100%;
  }

  .member-target-item {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .member-target-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }

  .records-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .btn-add-record {
    width: 100%;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .member-select {
    width: 100%;
  }

  .filtered-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .record-item {
    flex-wrap: wrap;
  }

  .record-info {
    width: 100%;
    margin-left: 0;
    margin-top: var(--spacing-sm);
  }

  .record-amount {
    margin-left: 0;
    margin-top: var(--spacing-sm);
  }

  .btn-delete-record {
    margin-left: auto;
  }
}
</style>
