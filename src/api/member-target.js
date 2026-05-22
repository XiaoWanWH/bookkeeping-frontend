import request from './request'

/**
 * 设置成员目标
 * @param {string|number} taskId - 任务ID
 * @param {object} data - 成员目标数据
 * @param {number} data.userId - 用户ID
 * @param {number} data.targetAmount - 目标金额
 * @returns {Promise}
 */
export function setMemberTarget(taskId, data) {
  return request.post(`/tasks/${taskId}/member-targets`, data)
}

/**
 * 删除成员目标
 * @param {string|number} taskId - 任务ID
 * @param {string|number} userId - 用户ID
 * @returns {Promise}
 */
export function deleteMemberTarget(taskId, userId) {
  return request.delete(`/tasks/${taskId}/member-targets/${userId}`)
}

/**
 * 获取成员目标列表
 * @param {string|number} taskId - 任务ID
 * @returns {Promise}
 */
export function getMemberTargets(taskId) {
  return request.get(`/tasks/${taskId}/member-targets`)
}
