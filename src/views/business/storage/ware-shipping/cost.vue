<!-- 出库费用 -->
<script>
import { getAcctCostShipping, deleteAcctCostShippingByIds } from '@/api/finance/acct-cost-shipping'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterFormCost from './components/enter-form-cost'

export default {
  name: 'Cost',
  components: { EnterFormCost },
  props: {
    tableRow: Object
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctCostShipping({
          ...pager,
          ...transforArrayPayload(Object.assign({ shippingId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'costType',
          title: '费用大类',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COST_TYPE)
            }
          }
        },
        { field: 'costName', title: '费用名称', searchProps: true },
        { field: 'costCurrency', title: '费用币别' },
        { field: 'costMoney', title: '费用金额', sum: true, align: 'right' },
        { field: 'costDate', title: '费用发生日期', searchProps: { type: 'date' } },
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
        visible: this.permissions[constant.PERMISSION_BASE_COST_ITEM_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_COST_ITEM_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_COST_ITEM_DEL],
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
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctCostShippingByIds(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['costRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['costRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cost-item">
    <!-- 列表页 -->
    <base-page
      ref="costRef"
      :name="constant.TABLE_NAME_WARE_SHIPPING_COST"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '135px'
      }"
    />
    <enter-form-cost v-model="enterForm.visible" :type="enterForm.type" :main-row="mainRow" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
