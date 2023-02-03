<!-- 记账汇率 -->
<script>
import { getBaseAccountRate, deleteBaseAccountRateById } from '@/api/base/base-account-rate'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import BigNumber from '@/utils/big-number'

export default {
  name: 'AccountRate',
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
        const { data } = await getBaseAccountRate({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'year',
          title: '年份',
          searchProps: { type: 'date', attrs: { type: 'year', valueFormat: 'yyyy', format: 'yyyy', placeholder: '选择年份' } }
        },
        {
          field: 'month',
          title: '月份',
          searchProps: { type: 'date', attrs: { type: 'month', valueFormat: 'MM', format: 'MM', placeholder: '选择月份' } }
        },
        {
          field: 'rate',
          title: '汇率',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        { field: 'originalCurrency', title: '原币', searchProps: true },
        { field: 'baseCurrency', title: '本位币', searchProps: true },
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
      show: this.permissions[constant.PERMISSION_ACCOUNT_RATE],
      mark: constant.PERMISSION_ACCOUNT_RATE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_ACCOUNT_RATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_ACCOUNT_RATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_ACCOUNT_RATE_DEL],
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
          deleteBaseAccountRateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['accountRateRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['accountRateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="account-rate">
    <!-- 列表页 -->
    <base-page
      ref="accountRateRef"
      :name="constant.TABLE_NAME_ACCOUNT_RATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
