<template>
  <div class="profile">
    <div class="page-header">
      <div class="header-content">
        <h2>个人资料</h2>
        <p>管理您的账户信息</p>
      </div>
    </div>

    <div class="profile-container" v-loading="loading">
      <!-- 头像区域 -->
      <el-card shadow="hover" class="avatar-card">
        <div class="profile-avatar-section">
          <div class="avatar-wrapper">
            <el-upload
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :http-request="handleAvatarUpload"
              accept="image/*"
              class="avatar-upload"
            >
              <div class="avatar-container">
                <Avatar
                  :avatar="userStore.avatar"
                  :username="userStore.username"
                  :nickname="userStore.nickname"
                  :size="110"
                />
                <div class="avatar-overlay">
                  <el-icon class="camera-icon"><Camera /></el-icon>
                  <span class="overlay-text">更换头像</span>
                </div>
              </div>
            </el-upload>
          </div>
          <div class="avatar-info">
            <h3 class="user-name">{{ userStore.nickname || userStore.username }}</h3>
            <p class="user-username">@{{ userStore.username }}</p>
          </div>
        </div>
      </el-card>

      <!-- 个人信息表单 -->
      <el-card shadow="hover" class="profile-card">
        <template #header>
          <div class="card-header">
            <span class="header-title">个人信息</span>
            <span class="header-subtitle">编辑您的个人资料</span>
          </div>
        </template>
        <div class="profile-form-section">
          <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-position="top" class="profile-form">
            <el-form-item label="用户名">
              <el-input :model-value="userStore.username" disabled prefix-icon="User" size="large">
                <template #append>
                  <el-tag type="info" size="small" class="disabled-tag">不可修改</el-tag>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="profileForm.nickname"
                placeholder="请输入昵称"
                prefix-icon="UserFilled"
                clearable
                size="large"
              />
            </el-form-item>

            <el-form-item class="submit-item">
              <el-button type="primary" :loading="saveLoading" @click="handleSaveProfile" class="save-btn">
                <el-icon><Check /></el-icon>
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateProfile, uploadAvatar } from '@/api/auth'
import Avatar from '@/components/Avatar.vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const saveLoading = ref(false)
const profileFormRef = ref(null)

const profileForm = reactive({
  nickname: ''
})

const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 20, message: '昵称长度为1-20个字符', trigger: 'blur' }
  ]
}

const loadProfile = () => {
  profileForm.nickname = userStore.nickname || ''
}

const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }
  return true
}

const handleAvatarUpload = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await uploadAvatar(formData)
    const avatarUrl = res.data
    userStore.$patch({
      userInfo: { ...userStore.userInfo, avatar: avatarUrl }
    })
    localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
    ElMessage.success('🎉 头像更新成功！')
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return
    saveLoading.value = true
    try {
      await updateProfile({ nickname: profileForm.nickname })
      userStore.$patch({
        userInfo: { ...userStore.userInfo, nickname: profileForm.nickname }
      })
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
      ElMessage.success('✓ 保存成功！')
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      saveLoading.value = false
    }
  })
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile {
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

.profile-container {
  max-width: 650px;
  margin: 0 auto;
}

.avatar-card {
  border-radius: 1.5rem;
  border: 1px solid var(--gray-200);
  margin-bottom: 1.5rem;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-upload {
  display: block;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  color: white;
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.overlay-text {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.avatar-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
  letter-spacing: -0.5px;
}

.user-username {
  font-size: 0.9375rem;
  color: var(--gray-500);
  font-weight: 500;
}

.profile-card {
  border-radius: 1.5rem;
  border: 1px solid var(--gray-200);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-title {
  font-weight: 800;
  font-size: 1.125rem;
  color: var(--gray-900);
}

.header-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 500;
}

.profile-form-section {
  padding-top: 0.5rem;
}

.profile-form {
  max-width: 100%;
}

.disabled-tag {
  font-weight: 600;
}

.submit-item {
  margin-top: 0.75rem;
}

.save-btn {
  font-weight: 600;
  border-radius: 0.875rem;
  padding: 0.75rem 2rem;
  height: auto;
  font-size: 0.9375rem;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.25s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
</style>

