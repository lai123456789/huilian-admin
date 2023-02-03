import { request } from '@/api'
export const url = '/admin/sys-file'
// 上传附件地址
export const uploadUrl = `${url}/upload`

/** 附件分页查询 */
export const getFile = data => {
  return request.get(`${url}/page`, data)
}

/** 附件删除 */
export const delSysFile = data => {
  return request.delete(url, data, { transferMode: 'form' })
}

/** 附件下载 */
export const downloadSysFile = (filename, bucket) => {
  return request.get(`${url}/${bucket}/${filename}`, {}, { responseType: 'blob' })
}

/** 附件上传 */
export const uploadSysFile = data => {
  return request.post(uploadUrl, data, { headers: { 'Content-Type': 'multipart/form-data' } })
}
