/** 报关辅助参数同步 */
import { request } from '@/api'
import config from '@/config'

const apiPrefix = config.apiPrefix
const url = `${apiPrefix}/baseCclSync`

/** 同步报关辅助参数 */
export const syncCclBaseCclSync = (data) => request.post(`${url}/syncCcl`, data, { transferMode: 'form' })
