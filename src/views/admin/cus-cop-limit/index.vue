<!-- 企业资质代码 -->
<script>
import { getBaseCclCopLimit, deleteBaseCclCopLimitById } from '@/api/base/base-ccl-cop-limit'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'CclCopLimit',
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
        const { data } = await getBaseCclCopLimit({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'code', title: '企业资质代码', searchProps: true },
        { field: 'name', title: '企业资质名称', searchProps: true },
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
      show: this.permissions[constant.PERMISSION_CUS_COP_LIMIT],
      mark: constant.PERMISSION_CUS_COP_LIMIT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CUS_COP_LIMIT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUS_COP_LIMIT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_COP_LIMIT_DEL],
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
          deleteBaseCclCopLimitById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cclCopLimitRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['cclCopLimitRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="ccl-cop-limit">
    <!-- 列表页 -->
    <base-page
      ref="cclCopLimitRef"
      :name="constant.TABLE_NAME_CUS_COP_LIMIT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '130px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
