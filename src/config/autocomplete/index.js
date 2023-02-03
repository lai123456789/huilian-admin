// 跟 base-autocomplete 相关组件配置
import company from './modules/company'
import product from './modules/product'
import base from './modules/base'
import admin from './modules/admin'
import business from './modules/business'
import finance from './modules/finance'

export default {
  ...company,
  ...product,
  ...base,
  ...admin,
  ...business,
  ...finance
}

