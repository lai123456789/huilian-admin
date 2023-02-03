<!-- 系统编码 -->
<script>
import { getSysNo, deleteSysNoById } from '@/api/admin/sys-no'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'SysNo',
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
        const { data } = await getSysNo({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'seqName', title: '编码名称', searchProps: true },
        { field: 'seqPrefix', title: '编码前缀', searchProps: true },
        { field: 'seqDescribe', title: '编码描述', searchProps: true },
        { field: 'seqLength', title: '补位长度' },
        { field: 'seqDateFormat', title: '日期格式' },
        {
          field: 'status',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ENABLE_DISABLE)
            }
          }
        }
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
      show: this.permissions[constant.PERMISSION_SYS_NO],
      mark: constant.PERMISSION_SYS_NO
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_NO_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_NO_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_NO_DEL],
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
          deleteSysNoById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['sysNoRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['sysNoRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="sys-no">
    <!-- 列表页 -->
    <base-page
      ref="sysNoRef"
      :name="constant.TABLE_NAME_SYS_NO"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
