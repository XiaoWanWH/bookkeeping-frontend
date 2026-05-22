import request from './request'

/**
 * 邀请成员加入任务
 * @param {number} taskId - 任务ID
 * @param {Object} data - { inviteUsername }
 */
export function inviteMember(taskId, data) {
  return request.post(`/tasks/${taskId}/invite`, data)
}

/**
 * 获取任务成员列表
 * @param {number} taskId - 任务ID
 */
export function getMembers(taskId) {
  return request.get(`/tasks/${taskId}/members`)
}

/**
 * 移除任务成员
 * @param {number} taskId - 任务ID
 * @param {number} memberId - 成员ID
 */
export function removeMember(taskId, memberId) {
  return request.delete(`/tasks/${taskId}/members/${memberId}`)
}
