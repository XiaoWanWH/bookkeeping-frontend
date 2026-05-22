import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    nickname: (state) => state.userInfo?.nickname || '',
    username: (state) => state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },

  actions: {
    /**
     * 用户登录
     */
    async login(loginForm) {
      const res = await loginApi(loginForm)
      // 后端返回 Result<String>，直接取 data 作为 token
      const token = res.data
      this.token = token
      localStorage.setItem('token', token)
      // 登录成功后获取用户信息
      await this.getUserInfo()
      return res
    },

    /**
     * 用户注册
     */
    async register(registerForm) {
      const res = await registerApi(registerForm)
      return res
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
      const res = await getUserInfoApi()
      this.userInfo = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    }
  }
})
