<!-- 报关名称归类库 -->
<script>
import { getCustomsNameDeclar, deleteCustomsNameDeclarById } from '@/api/customs/customs-name-declar'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'CustomsNameDeclar',
  components: { EnterForm, Drawer },
  data() {
    return {
      constant,
      tableRow: {},
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      request: async ({ pager, params }) => {
        const { data } = await getCustomsNameDeclar({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'customsCode', title: '海关编码', searchProps: true },
        { field: 'customsCodeName', title: '海关编码名称' },
        { field: 'customsName', title: '报关名称' },
        { field: 'customsElement', title: '报关申报要素' },
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
      show: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY],
      mark: constant.PERMISSION_CLEAR_CLASSIFY
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CLEAR_CLASSIFY_DEL],
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
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCustomsNameDeclarById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsNameDeclarRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
            // 第二个参数可能是在page组件下的buttons组件里面定义的loading状态对象，因此需要判断是否为函数
            if (cb && isFunction(cb)) {
              cb()
            }
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      const { customsCode } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: customsCode
      }
    },
    reLoad(isClearSelect) {
      this.$refs['customsNameDeclarRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-name-declar">
    <!-- 列表页 -->
    <base-page
      ref="customsNameDeclarRef"
      :name="constant.TABLE_NAME_CLEAR_CLASSIFY"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
