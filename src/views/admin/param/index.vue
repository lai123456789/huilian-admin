<!-- 参数管理 -->
<script>
import { getSysPublicParam, deleteSysPublicParamById, syncSysPublicParam } from '@/api/admin/sys-public-param'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'Param',
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
        const { data } = await getSysPublicParam({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'publicName', title: '参数名称', searchProps: true },
        { field: 'publicKey', title: '参数key' },
        {
          field: 'status',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ENANLE_DISABLE)
            }
          }
        },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      template: {
        visible: false,
        title: '',
        componentName: '',
        key: ''
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM],
      mark: constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_DEL],
        handler: this.handleDel
      },
      config: {
        visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_CONFIG],
        handler: this.handleConfig
      },
      mores: [
        {
          label: '同步缓存',
          visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_SYNC],
          noNeedRows: true,
          handler: this.handleSync
        },
        {
          label: '配置项',
          visible: this.permissions[constant.PERMISSION_ADMIN_SYS_PUBLIC_PARAM_CONFIG],
          handler: this.handleConfig
        }
      ]
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
          deleteSysPublicParamById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['paramRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    async handleConfig(row) {
      const { publicKey, publicName } = row[0]
      this.template.key = publicKey
      this.template.title = publicName
      const { default: vnode } = await this.getComponents(publicKey.toLowerCase().split('_').join('-'))
      this.template.componentName = vnode
      this.template.visible = true
    },
    getComponents(path) {
      return new Promise((reslove, reject) => {
        const url = path.replace('\\', '/')
        require([`@/views/admin/param/template/${url}.vue`], function (v) {
          reslove(v)
        }).catch(() => {
          reject(new Error('无法找到组件, 查看文件地址是否正确'))
        })
      })
    },
    handleSync() {
      syncSysPublicParam().then(() => {
        this.$message.success('同步成功')
      })
    },
    reLoad(isClearSelect) {
      this.$refs['paramRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="param">
    <!-- 列表页 -->
    <base-page
      ref="paramRef"
      :name="constant.TABLE_NAME_SYS_PUBLIC_PARAM"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <component
      :is="template.componentName"
      ref="templateRef"
      v-model="template.visible"
      :title="template.title"
      :template-key="template.key"
    ></component>
  </div>
</template>
