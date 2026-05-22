import request from './request'

/**
 * 添加收支记录
 * @param {Object} data - { taskId, type, amount, description, recordDate }
 */
export function addRecord(data) {
  return request.post('/records', data)
}

/**
 * 获取收支记录列表
 * @param {Object} params - { taskId, page, size, startDate, endDate, userId }
 */
export function getRecords(params) {
  return request.get('/records', { params })
}

/**
 * 删除收支记录
 * @param {number} recordId - 记录ID
 */
export function deleteRecord(recordId) {
  return request.delete(`/records/${recordId}`)
}
