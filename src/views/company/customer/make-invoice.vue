<!-- 委托客戶开票资料 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterFormMakeInvoice from './components/enter-form-make-invoice'
import { deleteCompanyInvoiceById, getCompanyInvoice } from '@/api/company/company-invoice'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'MakeInvoice',
  components: { EnterFormMakeInvoice },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyInvoice({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customerId: this.tableRow.id,
                companyId: this.tableRow.companyId
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'invoiceTitle', title: '发票抬头' },
        { field: 'invoiceType', title: '发票开具类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_INVOICE_TYPE)
            }
          }
        },
        { field: 'creditCode', title: '纳税识别号' },
        { field: 'bankName', title: '开户银行名称' },
        { field: 'bankNo', title: '基本开户账号' },
        { field: 'registerAddress', title: '注册场所地址' },
        { field: 'registerTel', title: '注册固定电话' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_INVOICE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_INVOICE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_INVOICE_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCompanyInvoiceById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['makeInvoiceRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['makeInvoiceRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="make-invoice">
    <!-- 列表页 -->
    <base-page
      ref="makeInvoiceRef"
      :name="constant.TABLE_NAME_CUSTOMER_INVOICE"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-make-invoice
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
