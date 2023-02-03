/**
  系统中跳转方法使用这里的方法
 */
import store from '@/store'
import constant from '@/constant'
import enums from '@/enums'

/**
 * @param {object} instance 当前组件的实例
 * @param {string} name 跳转页的路由视图
 * @param {object} params 跳转参数
 */
export default async function jump(instance, name, params) {
  if (instance.$route.name === name) return console.warn('当前页面和所跳转的页面相同')
  await isRepeView(name)
  instance.$router.replace({ name, params })
}

/**
 * 判断是否有存在相同的标签页被打开,有的话先删除之前再生成新的
 * @param {string} name 跳转页的路由视图
 */
export const isRepeView = async (name) => {
  // 获取标签页的数据
  const visitedViews = store.state.tagsView.visitedViews
  const currentViewIdx = visitedViews.findIndex(visitedView => visitedView.name === name)
  // 如果之前打开过标签页就把之前删除，重新打开标签页
  if (currentViewIdx >= 0) {
    await store.dispatch('tagsView/delView', visitedViews[currentViewIdx])
  }
}

/**
 * 订单编号跳转, 根据订单类型跳转对应订单
 * @param {object} row 当前行数据
 * @param {object} instance 当前组件实例
 */
export const jumpCorresOrder = (row, instance, orderType) => {
  let routerName = ''
  const currentOrderType = orderType || row.orderType
  switch (currentOrderType) {
    case enums.ORDER_TYPE.getFieldByKey('IMPORT'):
      routerName = constant.ROUTE_IMPORT_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('EXPORT'):
      routerName = constant.ROUTE_EXPORT_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'):
      routerName = constant.ROUTE_AGENT_PURCHASE_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_SALE'):
      routerName = constant.ROUTE_AGENT_SALE_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('SALE'):
      routerName = constant.ROUTE_SALES_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('PURCHASE'):
      routerName = constant.ROUTE_PURCHASE_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('STORAGE'):
      routerName = constant.ROUTE_STORAGE_ORDER
      break
    case enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT'):
      routerName = constant.ROUTE_AGENT_FREIGHT_ORDER
      break
  }
  jump(instance, routerName, { orderNo: row['orderNo'], filtersMark: true })
}

/**
 * 收付款方跳转, 根据收付款方类型跳转公司
 * @param {object} row 当前行数据
 * @param {object} instance 当前组件实例
 */
export const jumpCorresCompany = (row, instance, companyTypeFiled, companyNameFiled) => {
  let routerName = ''
  const currentCompanyType = row[companyTypeFiled]
  switch (currentCompanyType) {
    case enums.COMPANY_TYPE.getFieldByKey('CUSTOMER'):
      routerName = constant.ROUTE_CUSTOMER
      break
    case enums.COMPANY_TYPE.getFieldByKey('SUPPLIER'):
      routerName = constant.ROUTE_SUPPLIER
      break
    case enums.COMPANY_TYPE.getFieldByKey('FUNDERS'):
      routerName = constant.ROUTE_FUNDERS
      break
  }
  jump(instance, routerName, { companyName: row[companyNameFiled], filtersMark: true })
}

