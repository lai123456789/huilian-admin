<script>
// import AcctCostPay from '@/views/finance/acct-cost-pay/index'
import AcctCostPay from '@/views/common/acct-cost-pay'
import constant from '@/constant'
import enums from '@/enums'
export default {
  name: 'CustomsAcctCostPay',
  components: { AcctCostPay },
  data() {
    return {
      tableRow: {},
      permissionsCostPay: {
        add: constant.PERMISSION_CUSTOMS_ACCT_COST_PAY_ADD,
        edit: constant.PERMISSION_CUSTOMS_ACCT_COST_PAY_EDIT,
        del: constant.PERMISSION_CUSTOMS_ACCT_COST_PAY_DEL,
        pay: constant.PERMISSION_CUSTOMS_ACCT_COST_PAY_JUMP,
        import: constant.PERMISSION_CUSTOMS_ACCT_COST_PAY_IMPORT
      },
      // 报关单
      businessType: enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
    }
  },
  methods: {}
}
</script>

<template>
  <acct-cost-pay :business-type="businessType" :permissions-cost-pay="permissionsCostPay" :table-row="tableRow"></acct-cost-pay>
</template>
