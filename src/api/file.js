import request from './request'

/**
 * 上传文件
 * @param {FormData} formData - 包含 files 文件列表
 */
export function uploadFiles(formData) {
  return request.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
