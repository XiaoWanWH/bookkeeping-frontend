import request from './request'

/**
 * 获取我的邀请列表
 */
export function getInvitations() {
  return request.get('/invitations')
}

/**
 * 接受邀请
 * @param {number} id - 邀请ID
 */
export function acceptInvitation(id) {
  return request.post(`/invitations/${id}/accept`)
}

/**
 * 拒绝邀请
 * @param {number} id - 邀请ID
 */
export function rejectInvitation(id) {
  return request.post(`/invitations/${id}/reject`)
}
