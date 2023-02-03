import constant from '@/constant'
import { getUser } from '@/api/admin/user'
import { transforArrayPayload } from '@/utils'

export default {
  /** 角色名称*/
  [constant.AUTOCOMPLETE_KEY_CONSUMER]: {
    tableConfig: {
      columns: [
        {
          title: '姓名',
          field: 'realname',
          searchProps: true
        },
        {
          title: '用户名',
          field: 'username',
          searchProps: true
        },
        {
          title: '手机号',
          field: 'phone'
        },
        {
          title: '部门',
          field: 'deptName'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getUser({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records.map(v => {
                const roles = v.roleList.map(v => v.roleName).join('、')
                return { ...v, roles }
              }),
              total
            })
          })
        })
      }
    },
    valueKey: 'realname',
    fetchSuggestions: (payload, callback) => {
      getUser(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 商务信息 */
  [constant.AUTOCOMPLETE_KEY_TRADEMAN]: {
    tableConfig: {
      columns: [
        {
          title: '姓名',
          field: 'realname',
          searchProps: true
        },
        {
          title: '用户名',
          field: 'username',
          searchProps: true
        },
        {
          title: '手机号',
          field: 'phone'
        },
        {
          title: '部门',
          field: 'deptName'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
           getUser({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)), ...{ roleCodeList: ['ROLE_TRADE', 'ROLE_SUPERVISOR', 'ROLE_TRADE_MANAGER'].join(',') } }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records.map(v => {
                const roles = v.roleList.map(v => v.roleName).join('、')
                return { ...v, roles }
              }),
              total
            })
          })
        })
      }
    },
    valueKey: 'realname',
    fetchSuggestions: (payload, callback) => {
      getUser(Object.assign(payload, { roleCodeList: ['ROLE_TRADE', 'ROLE_SUPERVISOR', 'ROLE_TRADE_MANAGER'].join(',') })).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 业务信息 */
  [constant.AUTOCOMPLETE_KEY_SALEMAN]: {
    tableConfig: {
      columns: [
        {
          title: '姓名',
          field: 'realname',
          searchProps: true
        },
        {
          title: '用户名',
          field: 'username',
          searchProps: true
        },
        {
          title: '手机号',
          field: 'phone'
        },
        {
          title: '部门',
          field: 'deptName'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getUser({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)), ...{ roleCodeList: ['ROLE_SALE', 'ROLE_SALE_DIRECTOR'].join(',') } }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records.map(v => {
                const roles = v.roleList.map(v => v.roleName).join('、')
                return { ...v, roles }
              }),
              total
            })
          })
        })
      }
    },
    valueKey: 'realname',
    fetchSuggestions: (payload, callback) => {
      getUser(Object.assign(payload, { roleCodeList: ['ROLE_SALE', 'ROLE_SALE_DIRECTOR'].join(',') })).then(res => {
        callback(res.data.records || [])
      })
    }
  }
}
