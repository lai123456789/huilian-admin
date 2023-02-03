<script>
import AcctCostInvoice from '@/views/finance/acct-cost-invoice/index'
import constant from '@/constant'
import enums from '@/enums'
export default {
  name: 'CustomsAcctCostInvoice',
  components: { AcctCostInvoice },
  data() {
    return {
      buttonsObj: {
        main: constant.PERMISSION_CUSTOMS_ACCT_COST_INVOICE,
        add: constant.PERMISSION_CUSTOMS_ACCT_COST_INVOICE_ADD,
        edit: constant.PERMISSION_CUSTOMS_ACCT_COST_INVOICE_EDIT,
        del: constant.PERMISSION_CUSTOMS_ACCT_COST_INVOICE_DEL,
        import: constant.PERMISSION_CUSTOMS_ACCT_COST_INVOICE_IMPORT
      },
      businessType: enums.RELATION_BILL_TYPE.getFieldByKey('CUSTOMSDECLARATION')
    }
  },
  methods: {}
}
</script>

<template>
  <!-- 报关单 -->
  <acct-cost-invoice :business-type="businessType" :buttons-obj="buttonsObj"></acct-cost-invoice>
</template>
