<!-- 关区代码 -->
<script>
import { getSysNoticeTemplate, deleteSysNoticeTemplateById } from '@/api/admin/notice-template'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'NoticeTemplate',
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
        const { data } = await getSysNoticeTemplate({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'templateNo', title: '模板编号', searchProps: true },
        { field: 'templateName', title: '模板名称', searchProps: true },
        {
          field: 'templateType',
          title: '模板类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_NOTICE_TEMPLATE_TYPE)
            }
          }
        },
        {
          field: 'status',
          title: '状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ENABLE_DISABLE)
            }
          }
        },
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
      show: this.permissions[constant.PERMISSION_NOTICE_TEMPLATE],
      mark: constant.PERMISSION_NOTICE_TEMPLATE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_NOTICE_TEMPLATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_NOTICE_TEMPLATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_NOTICE_TEMPLATE_DEL],
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
          deleteSysNoticeTemplateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['noticeTemplateRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['noticeTemplateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="notice-template">
    <!-- 列表页 -->
    <base-page
      ref="noticeTemplateRef"
      :name="constant.TABLE_NAME_NOTICE_TEMPLATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '105px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
