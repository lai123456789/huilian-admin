import constant from '@/constant'
import { getDataDictionary } from '@/api/admin/dicts'
import { getOrderImport } from '@/api/order/order-import'
import { getOrderExport } from '@/api/order/order-export'
import { getOrderAgentPurchase } from '@/api/order/order-agent-purchase'
import { getOrderAgentSale } from '@/api/order/order-agent-sale'
import { getOrderSale } from '@/api/order/order-sale'
import { getOrderPurchase } from '@/api/order/order-purchase'
import { getOrderAgentFreight } from '@/api/order/order-agent-freight'
import { getOrderStorage } from '@/api/order/order-storage'
import { getCustomsNameDeclar } from '@/api/customs/customs-name-declar'
import { transforArrayPayload } from '@/utils'
import { getCustomsMaster } from '@/api/customs/customs-master'
import { getCustomsTransport } from '@/api/customs/customs-transport'
export default {
  /** 进口订单 */
  [constant.AUTOCOMPLETE_KEY_IMPORT_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'customerName', title: '客户名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'cusContractNo', title: '客户协议编号' },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderImport({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderImport(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 出口订单 */
  [constant.AUTOCOMPLETE_KEY_EXPORT_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'customerName', title: '客户名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'cusContractNo', title: '客户协议编号' },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderExport({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderExport(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 代采订单 */
  [constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'customerName', title: '客户名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'cusContractNo', title: '客户协议编号' },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderAgentPurchase({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderAgentPurchase(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 代销订单 */
  [constant.AUTOCOMPLETE_KEY_AGENT_SALE_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'customerName', title: '客户名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusContractNo', title: '客户协议编号' },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderAgentSale({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderAgentSale(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 销售订单 */
  [constant.AUTOCOMPLETE_KEY_SALE_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'customerName', title: '客户名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusContractNo', title: '客户协议编号' },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderSale({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderSale(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 采购订单 */
  [constant.AUTOCOMPLETE_KEY_PURCHASE_ORDER]: {
    tableConfig: {
      columns: [
        { field: 'supplierName', title: '供应商名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderPurchase({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderPurchase(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 货代订单 */
  [constant.AUTOCOMPLETE_KEY_AGENT_FREIGHT_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        { field: 'customerName', title: '客户名称' },
        { field: 'supplierName', title: '供应商名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderAgentFreight({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderAgentFreight(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 仓储订单 */
  [constant.AUTOCOMPLETE_KEY_STORAGE_ORDER]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        { field: 'customerName', title: '客户名称' },
        { field: 'supplierName', title: '供应商名称' },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'orderDate', title: '订单日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getOrderStorage({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'orderNo',
    fetchSuggestions: (payload, callback) => {
      getOrderStorage(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 报关名称 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMS_NAME_DECLAR]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        { field: 'customsCode', title: '海关编码', searchProps: true },
        { field: 'customsCodeName', title: '海关编码名称' },
        { field: 'customsName', title: '报关名称', searchProps: true },
        { field: 'customsElement', title: '报关申报要素' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCustomsNameDeclar({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'customsName',
    fetchSuggestions: (payload, callback) => {
      getCustomsNameDeclar(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 报关单 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_DECLAR]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        { field: 'contrNo', title: '合同协议号', searchProps: true },
        {
          field: 'iEFlag',
          title: '进出口标志',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'declareDate', title: '申报日期', searchProps: { type: 'date' } },
        { field: 'billNo', title: '提运单号', searchProps: true },
        {
          field: 'declareType',
          title: '申报类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_TYPE)
            }
          }
        },
        { field: 'cargoListNo', title: '航次号' },
        { field: 'entryId', title: '报关单号', searchProps: true },
        { field: 'declareTitle', title: '抬头方式' },
        { field: 'transMode', title: '成交方式' },
        { field: 'customerName', title: '客户名称', searchProps: true }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCustomsMaster({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'contrNo',
    fetchSuggestions: (payload, callback) => {
      getCustomsMaster(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 报关运输单 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMS_ORDER_TRANSPORT_DECLAR]: {
    tableConfig: {
      searchConfig: {
        labelWidth: '70px'
      },
      columns: [
        { field: 'transportNo', title: '运输单号', searchProps: true },
        {
          field: 'tradingType',
          title: '进出口标志',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'trafModeName', title: '运输方式', searchProps: true },
        { field: 'transportDate', title: '运输日期', searchProps: { type: 'date' } },
        {
          field: 'carType',
          title: '订车类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_HIRING_TAXIE_TYPE)
            }
          }
        },
        {
          field: 'carTrainNo',
          title: '车次类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRAIN_TYPE)
            }
          }
        },
        { field: 'entyPort', title: '出入境口岸' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCustomsTransport({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'transportNo',
    fetchSuggestions: (payload, callback) => {
      getCustomsTransport(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  }
}
