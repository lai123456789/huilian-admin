import FORM_TYPE from './base/form-type'
import WHETHER_STATUS from './base/whether-status'
import WHETHER_BOOLEAN_STATUS from './base/whether-boolean-status'
import ENABLE_DISABLE from './base/enable-disable'
import SEX from './base/sex'
import SOCIAL_TYPE from './base/social-type'
import LOCKFLAG from './base/lock'
import BUSINESS_CODE from './business/business-code'
import CUS_MARK_TYPE from './business/cus-mark-type'
import OPEN_MODE from './business/open-mode'
import MENU_TYPE from './business/menu-type'
import TAKE_DELIVERY_TYPE from './business/take-delivery-type'
import DELIVERY_TYPE from './business/delivery-type'
import COMPANY_REGION from './business/company-region'
import INVOICE_TYPE from './business/invoice-type'
import AUDIT_STATUS from './business/audit-status'
import AUTH_STATUS from './business/auth-status'
import TRAF_STATUS from './business/traf-status'
import ADDRESS_TYPE from './business/address-type'
import SHIPPING_TYPE from './business/shipping-type'
import ORDER_STATUS from './business/order-status'
import VERIFY_STATUS from './business/verify-status'
import FUNCTION_CALL_STATUS from './business/function-call-status'
import PAY_STATUS from './business/pay-status'
import IS_ENABLED_STATUS from './business/is-enabled-status'
import RULE_CONDITIONS from './business/rule-conditions'
import RECEIVING_STATUS from './business/receiving-status'
import RECEIVING_TYPE from './business/receiving-type'
import RECEIVE_TYPE from './business/receive-type'
import WARE_SHIPPING_STATUS from './business/ware-shipping-status'
import SHIPPING_FLAG from './business/shipping-flag'
import SETTLE_STATUS from './business/settle-status'
import DECLARE_STATUS from './business/declare-status'
import HI_PRICE_STATUS from './business/hi-price-status'
import TAX_REFUND_STATUS from './business/tax-refund-status'
import DEDUCT_STATUS from './business/deduct-status'
import TRADE_MODE from './business/trade-mode'
import AGREE_STATUS from './business/agree-status'
import AGENCY_MARK from './business/agency-mark'
import INTEREST_METHOD from './business/interest-method'
import SETTLEMENT_MANNER from './business/settlement-manner'
import COST_TYPE from './business/cost-type'
import COST_MOLD from './business/cost-mold'
import ORDER_TYPE from './business/order-type'
import SHIPPING_ORDER_TYPE from './business/shipping-order-type'
import COMPANY_TYPE from './business/company-type'
import PAY_COMPANY_TYPE from './business/pay-company-type'
import RECEIPT_PAY_STATUS from './business/receipt-pay-status'
import RECEIPT_USE from './business/receipt-use'
import PAY_USE from './business/pay-use'
import SERVICE_TAX_FLAG from './business/service-tax-flag'
import IEF_LAG from './business/ief-lag'
import TRANSPORT_MODE from './business/transport-mode'
import IS_CAR_POOLING from './business/is-car-pooling'
import CAR_TYPE from './business/car-type'
import IS_3C from './business/is-3c'
import PRICE_ERROR_STATUS from './business/price-error-status'
import DECLARATION_STATUS from './business/declaration-status'
import JOB_STATUS from './business/job-status'
import BORROW_TYPE from './business/borrow-type'
import DISPOSE_STATUS from './business/dispose-status'
import FILTER_STOCK from './business/filter-stock'
import DECLARE_TYPE from './business/declare-type'
import USANCE_FLAG from './business/usance-flag'
import RECEIPT_MODE from './business/receipt-mode'
import GROSS_WEIGHT_RULE from './business/gross-weight-rule'
import NOTICE_TEMPALTE_TYPE from './business/notice-template-type'
import ORDER_FINANCIAL_PAY_STATUS from './business/order-financial-pay-status'
import ORDER_FINANCIAL_COLLECT_STATUS from './business/order-financial-collect-status'
import ORDER_BILL_IMPORT_STATUS from './business/order-bill-import-status'
import ORDER_BILL_EXPORT_STATUS from './business/order-bill-export-status'
import RELATION_BILL_TYPE from './business/relation-bill-type'
import ORDER_PROCESS_STATUS from './business/order-process-status'
import PRODUCT_BRAND_AND_MODEL_UPPERCASE from './business/product-brand-uppercase'
import FOREIGN_PRICE_TYPE from './business/foreign-price-type'

export default Object.freeze({
  /** 表单类型 */
  FORM_TYPE,
  /** 是否状态 */
  WHETHER_STATUS,
  /** 是否状态(boolean) */
  WHETHER_BOOLEAN_STATUS,
  /** 禁用/启用 */
  ENABLE_DISABLE,
  /** 性别 */
  SEX,
  /** 社交登录 */
  SOCIAL_TYPE,
  /** 锁定/有效 */
  LOCKFLAG,
  /** 业务状态码 */
  BUSINESS_CODE,
  /** 运保杂标记类型 */
  CUS_MARK_TYPE,
  /** 打开方式 */
  OPEN_MODE,
  /** 菜单类型 */
  MENU_TYPE,
  /** 收货信息收货方式 */
  TAKE_DELIVERY_TYPE,
  /** 收货信息送货方式 */
  DELIVERY_TYPE,
  /** 所属区域 */
  COMPANY_REGION,
  /** 发票开具类型 */
  INVOICE_TYPE,
  /** 审核状态 */
  AUDIT_STATUS,
  /** 审核状态 */
  AUTH_STATUS,
  /** 地址类型 */
  ADDRESS_TYPE,
  /** 出库方式 */
  SHIPPING_TYPE,
  /** 运输状态 */
  TRAF_STATUS,
  /** 订单状态 */
  ORDER_STATUS,
  /** 核销状态 */
  VERIFY_STATUS,
  /** 付款状态 */
  PAY_STATUS,
  /** 退税状态 */
  TAX_REFUND_STATUS,
  /** 函调状态 */
  FUNCTION_CALL_STATUS,
  /** 抵扣状态 */
  DEDUCT_STATUS,
  /** 无效/有效 */
  IS_ENABLED_STATUS,
  /** 数据权限规则条件 */
  RULE_CONDITIONS,
  /** 入库类型 */
  RECEIVING_TYPE,
  /** 入库方式 */
  RECEIVE_TYPE,
  /** 入库状态 */
  RECEIVING_STATUS,
  /** 出库状态(订单) */
  WARE_SHIPPING_STATUS,
  /** 出库状态(出库单) */
  SHIPPING_FLAG,
  /** 结算状态 */
  SETTLE_STATUS,
  /** 贸易模式 */
  TRADE_MODE,
  /** 生效状态 */
  AGREE_STATUS,
  /** 归类状态 */
  DECLARE_STATUS,
  /** 审价状态 */
  HI_PRICE_STATUS,
  /** 计费方式 */
  AGENCY_MARK,
  /** 计息方式 */
  INTEREST_METHOD,
  /** 结算方式 */
  SETTLEMENT_MANNER,
  /** 费用大类 */
  COST_TYPE,
  /** 费用类型(费用类别) */
  COST_MOLD,
  /** 订单类型 */
  ORDER_TYPE,
  /** 订单类型(出库单) */
  SHIPPING_ORDER_TYPE,
  /** 公司类型 */
  COMPANY_TYPE,
  /** 收款方类型 付款方类型 */
  PAY_COMPANY_TYPE,
  /** 收款方式/付款方式 */
  RECEIPT_MODE,
  /** 收款单付汇状态/结汇状态 */
  RECEIPT_PAY_STATUS,
  /** 收款单款项用途 */
  RECEIPT_USE,
  /** 付款单款项用途 */
  PAY_USE,
  /** 发票类型 */
  SERVICE_TAX_FLAG,
  /** 进出口标志 */
  IEF_LAG,
  /** 运输方式 */
  TRANSPORT_MODE,
  /** 是否拼车 */
  IS_CAR_POOLING,
  /** 订车类型 */
  CAR_TYPE,
  /** 是否3c */
  IS_3C,
  /** 价格异常状态 */
  PRICE_ERROR_STATUS,
  /** 申报状态 */
  DECLARATION_STATUS,
  /** 定时任务状态 */
  JOB_STATUS,
  /** 借贷方向 */
  BORROW_TYPE,
  /** 处理状态 */
  DISPOSE_STATUS,
  /** 库存记录 - 过滤库存数据 */
  FILTER_STOCK,
  /** 申报类型 */
  DECLARE_TYPE,
  /** 是否远期 */
  USANCE_FLAG,
  /** 毛重分摊规则 */
  GROSS_WEIGHT_RULE,
  /** 通知模板类型 */
  NOTICE_TEMPALTE_TYPE,
  /** 订单财务付款状态 */
  ORDER_FINANCIAL_PAY_STATUS,
  /** 订单财务收款状态 */
  ORDER_FINANCIAL_COLLECT_STATUS,
  /** 订单财务票据进口状态 */
  ORDER_BILL_IMPORT_STATUS,
  /** 订单财务票据出口状态 */
  ORDER_BILL_EXPORT_STATUS,
  /** 关联单据类型 */
  RELATION_BILL_TYPE,
  /** 流程状态 */
  ORDER_PROCESS_STATUS,
  /** 品牌型号大小写 */
  PRODUCT_BRAND_AND_MODEL_UPPERCASE,
  /** 外汇牌价类型 */
  FOREIGN_PRICE_TYPE
})
