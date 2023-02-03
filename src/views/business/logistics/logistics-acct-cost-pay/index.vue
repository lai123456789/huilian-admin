<script>
import AcctCostPay from '@/views/common/acct-cost-pay'
import constant from '@/constant'
import enums from '@/enums'
export default {
  name: 'LogisticsAcctCostPay',
  components: { AcctCostPay },
  data() {
    return {
      tableRow: {},
      permissionsCostPay: {
        add: constant.PERMISSION_LOGISTICS_ACCT_COST_PAY_ADD,
        edit: constant.PERMISSION_LOGISTICS_ACCT_COST_PAY_EDIT,
        del: constant.PERMISSION_LOGISTICS_ACCT_COST_PAY_DEL,
        pay: constant.PERMISSION_LOGISTICS_ACCT_COST_PAY_JUMP,
        import: constant.PERMISSION_LOGISTICS_ACCT_COST_PAY_IMPORT
      },
      // 报关运输单
      businessType: enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATIONTRANSPORTATION')
    }
  },
  methods: {}
}
</script>

<template>
  <acct-cost-pay :business-type="businessType" :permissions-cost-pay="permissionsCostPay" :table-row="tableRow"></acct-cost-pay>
</template>
