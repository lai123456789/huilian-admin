<!-- 收款核销记录 -->
<script>
import { getAcctReceiptVerifyRecord } from '@/api/finance/acct-receipt-verify-record'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresCompany, jumpCorresOrder } from '@/utils/jump'
import { deleteAcctReceiptDetailByIds } from '@/api/finance/acct-receipt-detail'

export default {
  name: 'ReceiptVerifyRecord',
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
        const { data } = await getAcctReceiptVerifyRecord({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'receiptNo', title: '收款单号', searchProps: true, link: { name: constant.ROUTE_ACCT_RECEIPT, toField: true } },
        {
          field: 'costInvoiceNo',
          title: '应收编号',
          searchProps: true,
          link: { name: constant.ROUTE_ACCT_COST_INVOICE, toField: 'costNo' }
        },
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
        { field: 'receiptCurrency', title: '收款币别' },
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
          searchProps: true,
          link: row => jumpCorresCompany(row, this, 'payCompanyType', 'payCompanyName')
        },
        {
          field: 'principalName',
          title: '收款主体名称',
          searchProps: true,
          link: { name: constant.ROUTE_COMPANY, toField: 'companyName' }
        },
        { field: 'receiptBankName', title: '收款银行名称' },
        { field: 'receiptAccount', title: '收款银行账号' },
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
      show: this.permissions[constant.PERMISSION_ACCT_RECEIPT_VERIFY],
      mark: constant.PERMISSION_ACCT_RECEIPT_VERIFY
    }
    this.buttonsConfig = {
      mores: [
        {
          label: '反核销',
          visible: this.permissions[constant.PERMISSION_ACCT_RECEIPT_VERIFY_UN_WRITE_OFF],
          multiple: true,
          handler: rows => this.handleUnWriteOff(rows)
        }
      ]
    }
  },
  methods: {
    handleUnWriteOff(rows) {
      const ids = rows.map(record => record.id).join(',')
      deleteAcctReceiptDetailByIds(ids).then(() => {
        this.$message.success('操作成功')
        this.reLoad()
      })
    },
    reLoad(isClearSelect) {
      this.$refs['receiptVerifyRecordRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receipt-verify-record">
    <!-- 列表页 -->
    <base-page
      ref="receiptVerifyRecordRef"
      :name="constant.TABLE_NAME_ACCT_RECEIPT_VERIFY"
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
