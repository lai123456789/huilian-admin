<!-- 加征关税 -->
<script>
import { getBaseAddTariff, deleteBaseAddTariffById } from '@/api/base/base-add-tariff'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import BigNumber from '@/utils/big-number'

export default {
  name: 'Tariff',
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
        const { data } = await getBaseAddTariff({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'customsCode', title: '海关编码', searchProps: true },
        {
          field: 'addRate',
          title: '加征关税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        { field: 'country', title: '国家', searchProps: true },
        { field: 'effectiveDate', title: '生效日期' },
        { field: 'expireDate', title: '到期日期' },
        { field: 'remark', title: '备注' },
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
      show: this.permissions[constant.PERMISSION_BASE_ADD_TARIFF],
      mark: constant.PERMISSION_BASE_ADD_TARIFF
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_ADD_TARIFF_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_ADD_TARIFF_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_ADD_TARIFF_DEL],
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
          deleteBaseAddTariffById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['tariffRef'].handleTableClearCheckbox(true)
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
      this.$refs['tariffRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="tariff">
    <!-- 列表页 -->
    <base-page
      ref="tariffRef"
      :name="constant.TABLE_NAME_BASE_ADD_TARIFF"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
