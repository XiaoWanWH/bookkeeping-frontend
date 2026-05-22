import request from './request'

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export function login(data) {
  return request.post('/auth/login', data)
}

/**
 * 用户注册
 * @param {Object} data - { username, password, nickname }
 */
export function register(data) {
  return request.post('/auth/register', data)
}

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return request.get('/auth/info')
}

/**
 * 更新个人资料
 * @param {Object} data - { nickname }
 */
export function updateProfile(data) {
  return request.put('/auth/profile', data)
}

/**
 * 上传头像
 * @param {FormData} formData - 包含 avatar 文件
 */
export function uploadAvatar(formData) {
  return request.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
