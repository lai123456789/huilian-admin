import constant from '@/constant'
import BigNumber from '@/utils/big-number'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import { getBaseCurrency } from '@/api/base/base-currency'
import { getBaseWareHouse } from '@/api/base/base-ware-house'
import { getBaseCustomsCode, getCustomsCiqCodePageBaseCustomsCode } from '@/api/base/base-customs-code'
import { getBaseTaxCategory } from '@/api/base/base-tax-category'
import { getBaseCclUnit } from '@/api/base/base-ccl-unit'
import { getBaseCostItem } from '@/api/base/base-cost-item'

export default {
  /** 币别 */
  [constant.AUTOCOMPLETE_KEY_CURRENCY]: {
    tableConfig: {
      columns: [
        { field: 'currencyName', title: '货币名称' },
        { field: 'currencyCode', title: '货币代码' },
        { field: 'currencyNumber', title: '数字代码' },
        { field: 'simpleName', title: '简写' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseCurrency({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'currencyName',
    fetchSuggestions: (payload, callback) => {
      getBaseCurrency(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 海关编码 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMS_CODE]: {
    tableConfig: {
      columns: [
        { field: 'productCode', title: '商品编码', searchProps: true },
        { field: 'productName', title: '商品名称', searchProps: true },
        { field: 'firstUnit', title: '第一法定单位' },
        { field: 'secondUnit', title: '第二法定单位' },
        {
          field: 'exRate',
          title: '出口税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exRebateRate',
          title: '出口退税税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exTentativeRate',
          title: '出口暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'vatRate',
          title: '增值税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'preferentialRate',
          title: '最惠国税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imTentativeRate',
          title: '进口暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imGeneralRate',
          title: '进口普通税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exciseRate',
          title: '消费税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseCustomsCode({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'productCode',
    fetchSuggestions: (payload, callback) => {
      getBaseCustomsCode(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 计量单位代码 */
  [constant.AUTOCOMPLETE_KEY_CCL_UNIT]: {
    tableConfig: {
      columns: [
        { field: 'code', title: '计量单位代码', searchProps: true },
        { field: 'name', title: '计量单位名称', searchProps: true }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseCclUnit({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'code',
    fetchSuggestions: (payload, callback) => {
      getBaseCclUnit(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 仓库 */
  [constant.AUTOCOMPLETE_KEY_WAREHOUSE]: {
    tableConfig: {
      columns: [
        { field: 'warehouseName', title: '仓库名称' },
        { field: 'warehouseAddress', title: '仓库地址' },
        {
          field: 'region',
          title: '所属区域',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
            }
          }
        },
        { field: 'person', title: '管理人' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseWareHouse({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'warehouseName',
    fetchSuggestions: (payload, callback) => {
      getBaseWareHouse(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** CIQ代码 */
  [constant.AUTOCOMPLETE_KEY_CIQ_CODE]: {
    tableConfig: {
      columns: [
        { field: 'ciqCode', title: 'ciq代码', searchProps: true },
        { field: 'ciqName', title: 'ciq名称', searchProps: true }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCustomsCiqCodePageBaseCustomsCode({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'ciqCode',
    fetchSuggestions: (payload, callback) => {
      getCustomsCiqCodePageBaseCustomsCode(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 税收分类 */
  [constant.AUTOCOMPLETE_KEY_TAX_CATEGORY]: {
    tableConfig: {
      columns: [
        { field: 'codeNum', title: '税收编码' },
        { field: 'serviceAbbName', title: '商品或服务分类简称' },
        { field: 'serviceName', title: '商品或服务名称' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseTaxCategory({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'serviceName',
    fetchSuggestions: (payload, callback) => {
      getBaseTaxCategory(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 费用类目 */
  [constant.AUTOCOMPLETE_KEY_COST_ITEM]: {
    tableConfig: {
      columns: [
        { field: 'costName', title: '费用名称', searchProps: true },
        {
          field: 'costType', title: '费用大类', searchProps: { type: 'select' }, formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COST_TYPE)
            }
          }
        },
        { field: 'sort', title: '排序' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getBaseCostItem({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'costName',
    fetchSuggestions: (payload, callback) => {
      getBaseCostItem(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  }
}
