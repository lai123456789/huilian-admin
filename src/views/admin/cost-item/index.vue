<!-- 费用类目 -->
<script>
import { getBaseCostItem, deleteBaseCostItemById } from '@/api/base/base-cost-item'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'CostItem',
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
        const { data } = await getBaseCostItem({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'costName', title: '费用名称', searchProps: true },
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
      show: this.permissions[constant.PERMISSION_BASE_COST_ITEM],
      mark: constant.PERMISSION_BASE_COST_ITEM
    }
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseCostItemById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['costItemRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['costItemRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cost-item">
    <!-- 列表页 -->
    <base-page
      ref="costItemRef"
      :name="constant.TABLE_NAME_BASE_COST_ITEM"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
