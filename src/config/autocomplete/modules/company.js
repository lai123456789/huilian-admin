import constant from '@/constant'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import { getCompanyPrincipal } from '@/api/company/company-principal'
import { getCompanySupplier } from '@/api/company/company-supplier'
import { getCompanyCustomer } from '@/api/company/company-customer'
import { getCompanyTransport } from '@/api/company/company-transport'
import { getCompanyFunders } from '@/api/company/company-funders'
import { getCompanyInfo } from '@/api/company/company-info'
import { getCompanyCustoms } from '@/api/company/company-customs'
import { getCompanyCusDelivery } from '@/api/company/company-cus-delivery'
import { getCompanyCusCustomer } from '@/api/company/company-cus-customer'
import { getCompanyCusContract } from '@/api/company/company-cus-contract'
import { getCompanyInvoice } from '@/api/company/company-invoice'
import { getCompanyCusContractTemplate } from '@/api/company/company-cus-contract-template'

export default {
  /** 主体公司 */
  [constant.AUTOCOMPLETE_KEY_PRINCIPAL]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyPrincipal({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyPrincipal(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 主体公司(境外) */
  [constant.AUTOCOMPLETE_KEY_PRINCIPAL_EN]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业英文名称',
          field: 'companyNameEn',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyPrincipal({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      },
      searchConfig: {
        labelWidth: '115px'
      }
    },
    valueKey: 'companyNameEn',
    fetchSuggestions: (payload, callback) => {
      getCompanyPrincipal(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 供应商 */
  [constant.AUTOCOMPLETE_KEY_SUPPLIER]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanySupplier({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanySupplier(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 客户 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMER]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCustomer({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyCustomer(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 报关行 */
  [constant.AUTOCOMPLETE_KEY_CUSTOMS]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCustoms({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyCustoms(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 资金方 */
  [constant.AUTOCOMPLETE_KEY_FUNDERS]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyFunders({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyFunders(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 承运方 */
  [constant.AUTOCOMPLETE_KEY_TRANSPORT]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyTransport({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyTransport(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 企业信息 */
  [constant.AUTOCOMPLETE_KEY_COMPANY]: {
    tableConfig: {
      columns: [
        {
          title: '企业编号',
          field: 'companyNo',
          searchProps: true
        },
        {
          title: '企业名称',
          field: 'companyName',
          searchProps: true
        },
        {
          title: '企业地址',
          field: 'companyAddress'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyInfo({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyName',
    fetchSuggestions: (payload, callback) => {
      getCompanyInfo(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 销售客户 */
  [constant.AUTOCOMPLETE_KEY_CUS_CUSTOMER]: {
    tableConfig: {
      columns: [
        { field: 'companyName', title: '企业名称', searchProps: true },
        { field: 'companyNameEn', title: '企业英文名称' },
        { field: 'companyAddress', title: '企业地址' },
        { field: 'companyAddressEn', title: '企业英文地址' },
        {
          field: 'companyRegion',
          title: '所属区域',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
            }
          }
        },
        { field: 'mobile', title: '手机号' },
        { field: 'person', title: '联系人' },
        { field: 'phone', title: '座机' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCusCustomer({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'companyNameEn',
    fetchSuggestions: (payload, callback) => {
      getCompanyCusCustomer(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 客户开票资料 */
  [constant.AUTOCOMPLETE_KEY_CUS_MAKE_INVOICE]: {
    tableConfig: {
      columns: [
        { field: 'invoiceTitle', title: '发票抬头' },
        {
          field: 'invoiceType',
          title: '发票开具类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_INVOICE_TYPE)
            }
          }
        },
        { field: 'creditCode', title: '纳税识别号' },
        { field: 'bankName', title: '开户银行名称' },
        { field: 'bankNo', title: '基本开户账号' },
        { field: 'registerAddress', title: '注册场所地址' },
        { field: 'registerTel', title: '注册固定电话' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyInvoice({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'invoiceTitle',
    fetchSuggestions: (payload, callback) => {
      getCompanyInvoice(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 客户交货信息(收货信息) */
  [constant.AUTOCOMPLETE_KEY_CUS_DELIVERY]: {
    tableConfig: {
      columns: [
        { field: 'deliveryCompany', title: '交货公司' },
        {
          field: 'addressType',
          title: '地址类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ADDRESS_TYPE)
            }
          }
        },
        { field: 'deliveryAddress', title: '交货地址' },
        { field: 'person', title: '联系人' },
        { field: 'mobile', title: '联系电话' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCusDelivery({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'deliveryAddress',
    fetchSuggestions: (payload, callback) => {
      getCompanyCusDelivery(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 服务协议 */
  [constant.AUTOCOMPLETE_KEY_SERVICE_AGREE]: {
    tableConfig: {
      columns: [
        { field: 'contractNo', title: '协议编号' },
        { field: 'contractName', title: '协议名称' },
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCusContract({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'contractNo',
    fetchSuggestions: (payload, callback) => {
      getCompanyCusContract(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 服务协议模板 */
  [constant.AUTOCOMPLETE_KEY_SERVICE_AGREE_TEMPLATE]: {
    tableConfig: {
      columns: [
        { field: 'templateNo', title: '模板编号' },
        { field: 'templateName', title: '模板名称' },
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getCompanyCusContractTemplate({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    valueKey: 'templateName',
    fetchSuggestions: (payload, callback) => {
      getCompanyCusContractTemplate(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  }
}
