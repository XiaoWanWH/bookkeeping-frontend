<template>
  <div class="layout-container">
    <!-- 顶部栏 -->
    <header class="layout-header">
      <div class="logo" @click="goToDashboard">
        <div class="logo-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <span class="logo-text">记账本</span>
      </div>
      <div class="user-info">
        <!-- 事件通知按钮 -->
        <el-badge :value="unreadEvents" :hidden="unreadEvents === 0" class="notification-badge">
          <el-popover
            placement="bottom"
            :width="380"
            trigger="click"
            popper-class="notification-popover"
          >
            <div class="notification-panel">
              <div class="notification-header">
                <span class="notification-title">消息通知</span>
                <el-button type="primary" text size="small" @click="handleMarkAllAsRead" v-if="unreadEvents > 0">
                  全部已读
                </el-button>
              </div>
              <div class="notification-list">
                <div v-if="events.length === 0 && !loadingNotifications" class="empty-notifications">
                  <el-empty description="暂无消息通知" :image-size="60" />
                </div>
                <div
                  v-for="event in events"
                  :key="event.id"
                  class="notification-item"
                  :class="{ unread: !event.isRead }"
                  @click="handleEventClick(event)"
                >
                  <div class="notification-avatar">
                    <Avatar
                      :avatar="event.actorAvatar"
                      :username="event.actorUsername"
                      :nickname="event.actorNickname"
                      :size="40"
                    />
                  </div>
                  <div class="notification-content">
                    <div class="notification-text">{{ event.content }}</div>
                    <div class="notification-time">{{ formatTime(event.createTime) }}</div>
                  </div>
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click.stop="handleDeleteEvent(event.id)"
                    class="delete-btn"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <template #reference>
              <div class="notification-trigger">
                <el-icon><Bell /></el-icon>
              </div>
            </template>
          </el-popover>
        </el-badge>
        
        <div class="user-display">
          <Avatar
            :avatar="userStore.avatar"
            :username="userStore.username"
            :nickname="userStore.nickname"
            :size="36"
          />
          <div class="user-details">
            <span class="nickname">{{ userStore.nickname || userStore.username }}</span>
            <span class="welcome-text">欢迎回来</span>
          </div>
        </div>
        <el-dropdown trigger="click" @command="handleCommand" class="user-dropdown">
          <div class="dropdown-trigger">
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="custom-dropdown">
              <el-dropdown-item command="profile" class="dropdown-item">
                <el-icon class="item-icon"><User /></el-icon>
                <span>个人资料</span>
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided class="dropdown-item logout-item">
                <el-icon class="item-icon"><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="layout-body">
      <!-- 左侧菜单 -->
      <aside class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="transparent"
          text-color="#64748b"
          active-text-color="#667eea"
          class="custom-menu"
        >
          <el-menu-item index="/dashboard" class="menu-item">
            <el-icon class="menu-icon"><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/tasks" class="menu-item">
            <el-icon class="menu-icon"><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/invitations" class="menu-item">
            <el-icon class="menu-icon"><Bell /></el-icon>
            <span>我的邀请</span>
            <el-badge
              v-if="pendingInvitations > 0"
              :value="pendingInvitations"
              class="notification-badge"
              :offset="[10, 0]"
            />
          </el-menu-item>
          <el-menu-item index="/profile" class="menu-item">
            <el-icon class="menu-icon"><UserFilled /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧内容区 -->
      <main class="layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useInvitationStore } from '@/stores/invitation'
import Avatar from '@/components/Avatar.vue'
import { getEvents, markAsRead, markAllAsRead, deleteEvent } from '@/api/event'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const invitationStore = useInvitationStore()

const pendingInvitations = computed(() => invitationStore.pendingInvitations)
const events = ref([])
const loadingNotifications = ref(false)
let isFirstLoad = true

const unreadEvents = computed(() => events.value.filter(e => !e.isRead).length)

const activeMenu = computed(() => {
  if (route.path.startsWith('/tasks')) return '/tasks'
  return route.path
})

const goToDashboard = () => {
  router.push('/dashboard')
}

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
  }
}

const fetchPendingInvitations = async () => {
  await invitationStore.fetchInvitations()
}

const fetchEvents = async (showLoading = false) => {
  if (showLoading) {
    loadingNotifications.value = true
  }
  try {
    const res = await getEvents()
    const data = res.data || res
    events.value = Array.isArray(data) ? data : (data.list || data.content || data.records || [])
    isFirstLoad = false
  } catch (error) {
    console.error('获取事件通知失败:', error)
  } finally {
    if (showLoading) {
      loadingNotifications.value = false
    }
  }
}

const handleEventClick = async (event) => {
  if (!event.isRead) {
    try {
      await markAsRead(event.id)
      event.isRead = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  // 这里可以根据事件类型跳转到不同页面
  if (event.taskId) {
    router.push(`/tasks/${event.taskId}`)
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await markAllAsRead()
    events.value.forEach(e => e.isRead = true)
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('全部已读失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDeleteEvent = async (eventId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗?', '确认删除', {
      type: 'warning'
    })
    await deleteEvent(eventId)
    events.value = events.value.filter(e => e.id !== eventId)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const formatTime = (timeStr) => {
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time.toLocaleDateString()
}

onMounted(() => {
  fetchPendingInvitations()
  fetchEvents(true)
  
  // 定期更新事件通知（不显示加载状态）
  setInterval(() => fetchEvents(false), 30000)
})
</script>

<style scoped>
.layout-header {
  height: 72px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: var(--gradient-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-trigger {
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--gray-600);
}

.notification-trigger:hover {
  background: var(--gray-100);
  color: var(--primary-600);
}

.user-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.nickname {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.2;
}

.welcome-text {
  font-size: 0.75rem;
  color: var(--gray-500);
  line-height: 1.2;
}

.user-dropdown {
  cursor: pointer;
}

.dropdown-trigger {
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-trigger:hover {
  background: var(--gray-100);
}

.layout-aside {
  width: 260px;
  background: white;
  border-right: 1px solid var(--gray-200);
  overflow-y: auto;
  flex-shrink: 0;
  padding: 1.25rem 1rem;
}

.custom-menu {
  border-right: none;
}

.menu-item {
  margin: 0.25rem 0;
  border-radius: 0.875rem;
  height: 50px;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;
}

.menu-item:hover {
  background: var(--primary-50);
}

.menu-item.is-active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.menu-icon {
  font-size: 1.25rem;
}

.notification-badge {
  margin-right: 0.5rem;
}

/* 通知面板样式 */
.notification-panel {
  max-height: 480px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--gray-800);
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}



.empty-notifications {
  padding: 2rem 1rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: var(--gray-50);
}

.notification-item.unread {
  background: var(--primary-50);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-500);
}

.notification-avatar {
  flex-shrink: 0;
  padding-left: 12px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 0.9375rem;
  color: var(--gray-800);
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

/* 下拉菜单样式 */
.custom-dropdown {
  padding: 0.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--gray-200);
}

.dropdown-item {
  border-radius: 0.75rem;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--gray-100);
}

.item-icon {
  font-size: 1.125rem;
}

.logout-item {
  color: var(--danger-600);
}

.logout-item:hover {
  background: var(--danger-50);
}

.layout-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}
</style>
