<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="48"><Wallet /></el-icon>
        </div>
        <h2 class="title">记账本</h2>
        <p class="subtitle">管理财务，轻松记账</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="auth-btn"
            :loading="loading"
            @click="handleLogin"
          >
            <span v-if="!loading">
              <el-icon class="btn-icon"><Promotion /></el-icon>
              登录
            </span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
    <div class="decoration decoration-3"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Wallet, User, Lock, Promotion } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(loginForm)
      ElMessage.success('🎉 登录成功！欢迎回来')
      router.push('/dashboard')
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: 50%;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.login-form {
  margin-bottom: 0.5rem;
}

.auth-btn {
  width: 100%;
  height: 52px;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 1rem;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
  transition: all 0.25s ease;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.auth-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.25rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
  font-size: 0.875rem;
  color: var(--gray-500);
}

.register-link {
  color: var(--primary-600);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
  transition: color 0.25s ease;
}

.register-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

/* 装饰元素 */
.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  pointer-events: none;
}

.decoration-1 {
  width: 300px;
  height: 300px;
  background: white;
  top: 10%;
  left: 10%;
  animation: float 15s ease-in-out infinite;
}

.decoration-2 {
  width: 200px;
  height: 200px;
  background: white;
  bottom: 20%;
  right: 15%;
  animation: float 20s ease-in-out infinite reverse;
}

.decoration-3 {
  width: 150px;
  height: 150px;
  background: white;
  top: 50%;
  right: 5%;
  animation: float 18s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}
</style>

