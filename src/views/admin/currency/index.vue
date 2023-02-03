<!-- 币别 -->
<script>
import { getBaseCurrency, deleteBaseCurrencyById } from '@/api/base/base-currency'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Currency',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseCurrency({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'currencyName', title: '货币名称' },
        { field: 'currencyCode', title: '货币代码' },
        { field: 'currencyNumber', title: '数字代码' },
        { field: 'simpleName', title: '简写' },
        { field: 'sort', title: '排序' },
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
      show: this.permissions[constant.PERMISSION_BASE_CURRENCY],
      mark: constant.PERMISSION_BASE_CURRENCY
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_CURRENCY_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_CURRENCY_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_CURRENCY_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseCurrencyById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['currencyRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['currencyRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="currency">
    <!-- 列表页 -->
    <base-page
      ref="currencyRef"
      :name="constant.TABLE_NAME_CURRENCY"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
