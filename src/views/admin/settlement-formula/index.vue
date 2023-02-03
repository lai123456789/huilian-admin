<!-- 结算公式配置 -->
<script>
import { getBaseSettlementFormula, deleteBaseSettlementFormulaById } from '@/api/base/base-settlement-formula'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'SettlementFormula',
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
        const { data } = await getBaseSettlementFormula({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'name', title: '公式名称', searchProps: true },
        { field: 'formula', title: '计算公式', searchProps: true },
        {
          field: 'tradeMode',
          title: '贸易模式',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        {
          field: 'costType',
          title: '费用类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COST_MOLD)
            }
          }
        },
        { field: 'sort', title: '排序' },
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
      show: this.permissions[constant.PERMISSION_SET_FORMULA],
      mark: constant.PERMISSION_SET_FORMULA
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SET_FORMULA_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SET_FORMULA_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SET_FORMULA_DEL],
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
          deleteBaseSettlementFormulaById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['settlementFormulaRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['settlementFormulaRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="settlement-formula">
    <!-- 列表页 -->
    <base-page
      ref="settlementFormulaRef"
      :name="constant.TABLE_NAME_BASE_SET_FORMULA"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
