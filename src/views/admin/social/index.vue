<!-- 密钥管理 -->
<script>
import { getSocial, deleteSocialById } from '@/api/admin/social'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Social',
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
        const { data } = await getSocial({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'type',
          title: '类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SOCIAL_TYPE)
            }
          }
        },
        { field: 'remark', title: '描述' },
        { field: 'appId', title: 'appId' },
        { field: 'appSecret', title: 'appSecret' },
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
      show: this.permissions[constant.PERMISSION_SYS_SOCIAL],
      mark: constant.PERMISSION_SYS_SOCIAL
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_SOCIAL_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_SOCIAL_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_SOCIAL_DEL],
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
          deleteSocialById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['socialRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['socialRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="social">
    <!-- 列表页 -->
    <base-page
      ref="socialRef"
      :name="constant.TABLE_NAME_SYS_SOCIAL"
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
