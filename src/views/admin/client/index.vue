<!-- 终端管理 -->
<script>
import { getClient, deleteClientById } from '@/api/admin/client'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import ViewrForm from './components/viewr-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Client',
  components: { EnterForm, ViewrForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      viewrForm: {
        visible: false
      },
      tableRow: {},
      request: async ({ pager, params, options }) => {
        const { data } = await getClient({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records.map(v => {
            const authorizedGrantType = this.transformAuthorizedGrantType(v.authorizedGrantTypes, options['authorizedGrantType'])
            return { ...v, authorizedGrantType }
          }),
          total: data.total
        }
      },
      columns: [
        { field: 'clientId', title: '编号' },
        { field: 'clientSecret', title: '密钥' },
        { field: 'scope', title: '域' },
        {
          field: 'autoapprove',
          title: '自动放行',
          formatter: {
            type: 'options',
            config: {
              options: enums.WHETHER_BOOLEAN_STATUS.getList()
            }
          }
        },
        {
          field: 'authorizedGrantType',
          title: '授权模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_GRANT_TYPES)
            }
          }
        },
        { field: 'accessTokenValidity', title: '令牌时效' },
        { field: 'refreshTokenValidity', title: '刷新时效' }
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
      show: this.permissions[constant.PERMISSION_SYS_CLIENT],
      mark: constant.PERMISSION_SYS_CLIENT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_CLIENT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_CLIENT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_CLIENT_DEL],
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
          deleteClientById(row.clientId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['clientRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    openViewDetails({ row }) {
      this.tableRow = row
      this.viewrForm.visible = true
    },
    transformAuthorizedGrantType(data, options = []) {
      let str = ''
      for (let i = 0; i < data.length; i++) {
        for (let v = 0; v < options.length; v++) {
          if (data[i] === options[v].value) {
            str += (i === 0 ? '' : ' | ') + options[v].label
            break
          }
        }
      }
      return str
    },
    reLoad(isClearSelect) {
      this.$refs['clientRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="client">
    <!-- 列表页 -->
    <base-page
      ref="clientRef"
      :name="constant.TABLE_NAME_SYS_CLIENT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
      @cell-dblclick="openViewDetails"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <viewr-form v-model="viewrForm.visible" :table-row="tableRow" :transform-authorized-grant-type="transformAuthorizedGrantType" />
  </div>
</template>
