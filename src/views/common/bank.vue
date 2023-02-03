<!-- 银行资料 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterFormBank from './components/enter-form-bank'
import { getDataDictionary } from '@/api/admin/dicts'
import { deleteCompanyBankById, getCompanyBank } from '@/api/company/company-bank'

export default {
  name: 'Bank',
  components: { EnterFormBank },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    permissionsBank: Object
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
        const { data } = await getCompanyBank({
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
        { field: 'bankName', title: '银行名称' },
        { field: 'accountCode', title: '银行账号' },
        { field: 'accountName', title: '开户名称' },
        { field: 'bankAddress', title: '银行地址' },
        {
          field: 'region',
          title: '所属区域',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
            }
          }
        },
        { field: 'swiftCode', title: '国际银联号' },
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
        visible: this.permissions[this.permissionsBank.add],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[this.permissionsBank.edit],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[this.permissionsBank.del],
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
          deleteCompanyBankById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['BankDetailRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['BankDetailRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="bank">
    <!-- 列表页 -->
    <base-page
      ref="BankDetailRef"
      :name="constant.TABLE_NAME_CUSTOMER_BANK"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-bank
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
