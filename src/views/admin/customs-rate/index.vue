<!-- 海关汇率 -->
<script>
import { getBaseCustomsRate, deleteBaseCustomsRateById } from '@/api/base/base-customs-rate'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'
import EnterForm from './components/enter-form'
import SyncEnterForm from './components/sync-enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'CustomsRate',
  components: { EnterForm, SyncEnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      syncEnterForm: {
        visible: false
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseCustomsRate({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'currency', title: '币别', searchProps: true },
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
      show: this.permissions[constant.PERMISSION_BASE_CUSTOMS_RATE],
      mark: constant.PERMISSION_BASE_CUSTOMS_RATE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_CUSTOMS_RATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_CUSTOMS_RATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_CUSTOMS_RATE_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '同步海关汇率',
          visible: this.permissions[constant.PERMISSION_BASE_CUSTOMS_RATE_SYNC],
          noNeedRows: true,
          handler: this.handleSyncCustomsRate
        }
      ]
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
          deleteBaseCustomsRateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsRateRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleSyncCustomsRate() {
      this.syncEnterForm.visible = true
    },
    reLoad(isClearSelect) {
      this.$refs['customsRateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-rate">
    <!-- 列表页 -->
    <base-page
      ref="customsRateRef"
      :name="constant.TABLE_NAME_CUSTOMS_RATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <sync-enter-form v-model="syncEnterForm.visible" :re-load="reLoad" />
  </div>
</template>
