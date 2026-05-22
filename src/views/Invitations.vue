<template>
  <div class="invitations">
    <div class="page-header">
      <div class="header-content">
        <h2>我的邀请</h2>
        <p>管理您收到的任务邀请</p>
      </div>
    </div>

    <div v-loading="loading" class="invitations-container">
      <div v-if="invitations.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="invitation in invitations"
            :key="invitation.id"
            :timestamp="formatDate(invitation.createTime)"
            placement="top"
            :type="getStatusType(invitation.status)"
            class="timeline-item"
          >
            <el-card shadow="hover" class="invitation-card">
              <div class="invitation-item">
                <div class="inviter-avatar">
                  <Avatar
                    :avatar="invitation.inviter?.avatar"
                    :username="invitation.inviter?.username"
                    :nickname="invitation.inviter?.nickname"
                    :size="52"
                  />
                </div>
                <div class="invitation-info">
                  <div class="invitation-task">
                    <span class="inviter-name">
                      {{ invitation.inviter?.nickname || invitation.inviter?.username }}
                    </span>
                    <span class="invitation-text">邀请你加入任务</span>
                    <el-tag size="small" class="task-tag">
                      {{ invitation.task?.name }}
                    </el-tag>
                  </div>
                  <div class="invitation-status">
                    <el-tag :type="getStatusType(invitation.status)" size="small" class="status-tag">
                      {{ getStatusText(invitation.status) }}
                    </el-tag>
                  </div>
                </div>
                <div v-if="invitation.status === 0" class="action-buttons">
                  <el-button type="success" size="small" @click="handleAccept(invitation.id)" class="accept-btn">
                    <el-icon><Check /></el-icon>
                    接受
                  </el-button>
                  <el-button type="danger" size="small" @click="handleReject(invitation.id)" class="reject-btn">
                    <el-icon><Close /></el-icon>
                    拒绝
                  </el-button>
                </div>
                <div v-else class="status-icon">
                  <el-icon v-if="invitation.status === 1" class="success-icon"><CircleCheck /></el-icon>
                  <el-icon v-else-if="invitation.status === 2" class="danger-icon"><CircleClose /></el-icon>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <el-empty v-if="!loading && invitations.length === 0" description="暂无邀请" :image-size="100" class="empty-state" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getInvitations, acceptInvitation, rejectInvitation } from '@/api/invitation'
import { formatDate } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const invitations = ref([])

const getStatusText = (status) => {
  const map = {
    0: '待处理',
    1: '已接受',
    2: '已拒绝'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

const fetchInvitations = async () => {
  loading.value = true
  try {
    const res = await getInvitations()
    invitations.value = res.data || res || []
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleAccept = async (id) => {
  try {
    await acceptInvitation(id)
    ElMessage.success('🎉 已接受邀请！')
    fetchInvitations()
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

const handleReject = async (id) => {
  try {
    await rejectInvitation(id)
    ElMessage.success('已拒绝邀请')
    fetchInvitations()
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  fetchInvitations()
})
</script>

<style scoped>
.invitations {
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

.invitations-container {
  max-width: 900px;
  margin: 0 auto;
}

.timeline-item {
  margin-bottom: 0.5rem;
}

.invitation-card {
  border-radius: 1.25rem;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.invitation-card:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.invitation-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem 0;
}

.inviter-avatar {
  flex-shrink: 0;
}

.invitation-info {
  flex: 1;
  min-width: 0;
}

.invitation-task {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.inviter-name {
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--gray-900);
}

.invitation-text {
  color: var(--gray-600);
  font-size: 0.9375rem;
}

.task-tag {
  font-weight: 600;
  margin-left: 0.25rem;
}

.invitation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-tag {
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.accept-btn, .reject-btn {
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-icon {
  flex-shrink: 0;
}

.success-icon {
  color: var(--success-600);
  font-size: 1.75rem;
}

.danger-icon {
  color: var(--danger-600);
  font-size: 1.75rem;
}

.empty-state {
  padding: 4rem 0;
}
</style>

