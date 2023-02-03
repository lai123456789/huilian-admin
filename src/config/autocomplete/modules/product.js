import constant from '@/constant'
import { transforArrayPayload } from '@/utils'
import { getProductInfo } from '@/api/product/product-info'
import { getProductUnit } from '@/api/product/product-unit'

const publicProductConfig = {
  tableConfig: {
    columns: [
      { field: 'productName', title: '品名', searchProps: true },
      { field: 'productNo', title: '商品编号' },
      { field: 'productBrand', title: '品牌' },
      { field: 'productModel', title: '型号', searchProps: true },
      { field: 'productOrigin', title: '产地' },
      { field: 'productUnit', title: '单位' }
    ],
    request: ({ pager, params, extraParams }) => {
      return new Promise(resolve => {
        getProductInfo({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
          const { records, total } = res.data
          resolve({
            data: records || [],
            total
          })
        })
      })
    }
  },
  fetchSuggestions: (payload, callback) => {
    getProductInfo(payload).then(res => {
      callback(res.data.records || [])
    })
  }
}

export default {
  /** 型号 */
  [constant.AUTOCOMPLETE_KEY_PRODUCT_MODEL]: {
    ...publicProductConfig,
    valueKey: 'productModel'
  },
  /** 单位 */
  [constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT]: {
    tableConfig: {
      columns: [
        { field: 'unitName', title: '单位名称(中文)', searchProps: true },
        { field: 'unitNameEn', title: '单位名称(英文)' },
        { field: 'sort', title: '排序' },
        { field: 'createTime', title: '创建时间' }
      ],
      request: ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          getProductUnit({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
    },
    fetchSuggestions: (payload, callback) => {
      getProductUnit(payload).then(res => {
        callback(res.data.records || [])
      })
    },
    valueKey: 'unitName'
  }
}
