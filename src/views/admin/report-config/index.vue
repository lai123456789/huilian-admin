<!-- 报表配置 -->
<script>
import { getSysReportConfig, deleteSysReportConfigById } from '@/api/admin/sys-report-config'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'

export default {
  name: 'ReportConfig',
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
        const { data } = await getSysReportConfig({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'menuMark', title: '菜单标识', searchProps: true },
        {
          field: 'exportType',
          title: '设计器类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_EXPORT_TYPE)
            }
          }
        },
        {
          field: 'reportType',
          title: '报表类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_REPORT_TYPE)
            }
          }
        },
        { field: 'exportFileName', title: '导出文件名', searchProps: true },
        { field: 'sourceFileName', title: '源文件名', searchProps: true },
        { field: 'reqParam', title: '请求参数' },
        { field: 'metadata', title: '元数据' },
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
      show: this.permissions[constant.PERMISSION_SYS_REPORT_CONFIG],
      mark: constant.PERMISSION_SYS_REPORT_CONFIG
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_REPORT_CONFIG_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_REPORT_CONFIG_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_REPORT_CONFIG_DEL],
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
          deleteSysReportConfigById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['reportConfigRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['reportConfigRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="report-config">
    <!-- 列表页 -->
    <base-page
      ref="reportConfigRef"
      :name="constant.TABLE_NAME_SYS_REPORT_CONFIG"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '120px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
