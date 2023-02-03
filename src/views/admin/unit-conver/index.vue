<!-- 申报单位转换 -->
<script>
import { getBaseUnitConvert, deleteBaseUnitConvertById } from '@/api/base/base-unit-convert'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'UniConver',
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
        const { data } = await getBaseUnitConvert({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'fromUnit', title: '转换前单位' },
        { field: 'toUnit', title: '转换后单位' },
        { field: 'convertNum', title: '转换系数' },
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
      show: this.permissions[constant.PERMISSION_UNIT_CONVER],
      mark: constant.PERMISSION_UNIT_CONVER
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_UNIT_CONVER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_UNIT_CONVER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_UNIT_CONVER_DEL],
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
          deleteBaseUnitConvertById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['unitConverRef'].handleTableClearCheckbox(true)
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
      this.$refs['unitConverRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="unit_conver">
    <!-- 列表页 -->
    <base-page
      ref="unitConverRef"
      :name="constant.TABLE_NAME_UNIT_CONVER"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
