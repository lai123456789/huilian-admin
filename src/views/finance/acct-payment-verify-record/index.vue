<!-- 付款核销记录 -->
<script>
import { getAcctPaymentVerifyRecord } from '@/api/finance/acct-payment-verify-record'
import { deleteAcctPaymentDetailByIds } from '@/api/finance/acct-payment-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresCompany, jumpCorresOrder } from '@/utils/jump'

export default {
  name: 'PaymentVerifyRecord',
  components: {},
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctPaymentVerifyRecord({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'payNo', title: '付款单号', searchProps: true, link: { name: constant.ROUTE_PAYMENT_ORDER, toField: true } },
        { field: 'costPayNo', title: '应付编号', searchProps: true, link: { name: constant.ROUTE_ACCT_COST_PAY, toField: 'costNo' } },
        {
          field: 'orderType',
          title: '订单类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
            }
          }
        },
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: true,
          link: row => jumpCorresOrder(row, this)
        },
        {
          field: 'costType',
          title: '费用大类',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COST_TYPE)
            }
          }
        },
        { field: 'costName', title: '费用名称', searchProps: true },
        { field: 'payCurrency', title: '付款币别' },
        {
          field: 'verifyMoney',
          title: '核销金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'receiptCompanyType',
          title: '收款方类型',
          searchProps: true,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
            }
          }
        },
        {
          field: 'receiptCompanyName',
          title: '收款方名称',
          searchProps: true,
          link: row => jumpCorresCompany(row, this, 'payCompanyType', 'payCompanyName')
        },
        {
          field: 'principalName',
          title: '付款主体名称',
          searchProps: true,
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' }
        },
        { field: 'payBankName', title: '付款银行名称' },
        { field: 'payAccount', title: '付款银行账号' },
        { field: 'serialNumber', title: '银行流水号' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_ACCT_PAYMENT_VERIFY],
      mark: constant.PERMISSION_ACCT_PAYMENT_VERIFY
    }
    this.buttonsConfig = {
      mores: [
        {
          label: '反核销',
          visible: this.permissions[constant.PERMISSION_ACCT_PAYMENT_VERIFY_UN_WRITE_OFF],
          multiple: true,
          handler: rows => this.handleUnWriteOff(rows)
        }
      ]
    }
  },
  methods: {
    handleUnWriteOff(rows) {
      const ids = rows.map(record => record.id).join(',')
      deleteAcctPaymentDetailByIds(ids).then(() => {
        this.$message.success('操作成功')
        this.reLoad()
      })
    },
    reLoad(isClearSelect) {
      this.$refs['paymentVerifyRecordRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="payment-verify-record">
    <!-- 列表页 -->
    <base-page
      ref="paymentVerifyRecordRef"
      :name="constant.TABLE_NAME_ACCT_PAYMENT_VERIFY"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
    />
  </div>
</template>
