import constant from '@/constant'
import { getAcctPayment } from '@/api/finance/acct-payment'
import { getAcctReceipt } from '@/api/finance/acct-receipt'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'

export default {
  /** 付款单 */
  [constant.AUTOCOMPLETE_KEY_ACCT_PAYMENT]: {
    tableConfig: {
      columns: [
        {
          field: 'payStatus',
          title: '付款状态',
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_STATUS)
            }
          }
        },
        {
          field: 'verifyStatus',
          title: '核销状态',
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_VERIFY_STATUS)
            }
          }
        },
        { field: 'payNo', title: '付款单编号', searchProps: true },
        { field: 'customerName', title: '委托客户', searchProps: true },
        {
          field: 'receiptCompanyType',
          title: '收款方类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
            }
          }
        },
        {
          field: 'receiptCompanyName',
          title: '收款方名称'
        }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getAcctPayment({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records,
              total
            })
          })
        })
      }
    },
    valueKey: 'payNo',
    fetchSuggestions: (payload, callback) => {
      getAcctPayment(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  },
  /** 收款单 */
  [constant.AUTOCOMPLETE_KEY_ACCT_RECEIPT]: {
    tableConfig: {
      columns: [
        { field: 'receiptNo', title: '收款单号', searchProps: true },
        {
          field: 'payCompanyType',
          title: '付款方类型',
          searchProps: true,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
            }
          }
        },
        {
          field: 'payCompanyName',
          title: '付款方名称',
          searchProps: true
        },
        {
          field: 'receiptUse',
          title: '款项用途',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIPT_USE)
            }
          }
        },
        { field: 'receiptDate', title: '收款日期' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getAcctReceipt({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records,
              total
            })
          })
        })
      }
    },
    valueKey: 'receiptNo',
    fetchSuggestions: (payload, callback) => {
      getAcctReceipt(payload).then(res => {
        callback(res.data.records || [])
      })
    }
  }
}
