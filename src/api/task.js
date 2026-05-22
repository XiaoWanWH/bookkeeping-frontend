import request from './request'

/**
 * 创建任务
 * @param {Object} data - { name, description, priority, targetAmount }
 */
export function createTask(data) {
  return request.post('/tasks', data)
}

/**
 * 更新任务
 * @param {number} id - 任务ID
 * @param {Object} data - { name, description, priority, targetAmount }
 */
export function updateTask(id, data) {
  return request.put(`/tasks/${id}`, data)
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 */
export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}

/**
 * 获取任务列表
 * @param {Object} params - { page, size, keyword, sortBy, sortOrder }
 */
export function getTaskList(params) {
  return request.get('/tasks', { params })
}

/**
 * 获取任务详情
 * @param {number} id - 任务ID
 */
export function getTaskDetail(id) {
  return request.get(`/tasks/${id}`)
}
