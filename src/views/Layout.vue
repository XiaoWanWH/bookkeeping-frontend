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
import Avatar from '@/components/Avatar.vue'
import { getInvitations } from '@/api/invitation'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pendingInvitations = ref(0)

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
  try {
    const res = await getInvitations()
    const data = res.data || res
    const list = Array.isArray(data) ? data : (data.list || data.content || data.records || [])
    pendingInvitations.value = list.filter(inv => inv.status === 0 || inv.status === 'PENDING').length
  } catch (error) {
    // 忽略错误
  }
}

onMounted(() => {
  fetchPendingInvitations()
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

