<!-- 外汇汇率 -->
<script>
import { getBaseForeignRate, deleteBaseForeignRateById } from '@/api/base/base-foreign-rate'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import SyncEnterForm from '@/views/admin/foreign-rate/components/sync-enter-form'
import BigNumber from '@/utils/big-number'

export default {
  name: 'ForeignRate',
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
        const { data } = await getBaseForeignRate({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'currency', title: '币别', searchProps: true },
        {
          field: 'buyingRate',
          title: '现汇买入价',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          },
          align: 'right'
        },
        {
          field: 'buyingPrice',
          title: '现钞买入价',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          },
          align: 'right'
        },
        {
          field: 'sellingRate',
          title: '现汇卖出价',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          },
          align: 'right'
        },
        {
          field: 'sellingPrice',
          title: '现钞卖出价',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          },
          align: 'right'
        },
        { field: 'releaseDate', title: '发布日期', searchProps: { type: 'date' } },
        { field: 'releaseTime', title: '发布时间', searchProps: { type: 'time' } },
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
      show: this.permissions[constant.PERMISSION_BASE_FOREIGN_RATE],
      mark: constant.PERMISSION_BASE_FOREIGN_RATE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_FOREIGN_RATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_FOREIGN_RATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_FOREIGN_RATE_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '同步外汇汇率',
          visible: this.permissions[constant.PERMISSION_BASE_FOREIGN_RATE_SYNC],
          noNeedRows: true,
          handler: this.handleSyncForeignRate
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
          deleteBaseForeignRateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['foreignRateRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleSyncForeignRate() {
      this.syncEnterForm.visible = true
    },
    reLoad(isClearSelect) {
      this.$refs['foreignRateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="foreign-rate">
    <!-- 列表页 -->
    <base-page
      ref="foreignRateRef"
      :name="constant.TABLE_NAME_BASE_FOREIGN_RATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <sync-enter-form v-model="syncEnterForm.visible" :re-load="reLoad" />
  </div>
</template>
