<!-- 模型管理 -->
<script>
import { getModel, deleteModelById, deployModel } from '@/api/admin/model'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { isRepeView } from '@/utils/jump'

export default {
  name: 'Activiti',
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
        const { data } = await getModel({ ...pager, ...transforArrayPayload(Object.assign({ descs: 'create_time' }, params)) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'id', title: '模型ID' },
        { field: 'key', title: '模型标识' },
        { field: 'category', title: '流程分类', searchProps: true },
        { field: 'name', title: '模型名称' },
        { field: 'version', title: '版本号' },
        { field: 'createTime', title: '创建时间' },
        { field: 'lastUpdateTime', title: '最后更新时间' }
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
      show: this.permissions[constant.PERMISSION_SYNERGY_ACTIVITI],
      mark: constant.PERMISSION_SYNERGY_ACTIVITI
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYNERGY_ACTIVITI_ADD],
        handler: this.handleAdded
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYNERGY_ACTIVITI_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '模型图',
          visible: this.permissions[constant.PERMISSION_SYNERGY_ACTIVITI_MODEL],
          handler: this.handleModel
        },
        {
          label: '部署',
          visible: this.permissions[constant.PERMISSION_SYNERGY_ACTIVITI_DEPLOY],
          handler: this.handleDeploy
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
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteModelById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['activitiRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    async handleModel([{ id }]) {
      this.$router.push(`/activiti/dxf/${id}`)
      // 如果之前有打开过不同的模型图先删除之前再打开新的
      await isRepeView('Dxf')
      // window.open(`${window.location.origin}/act/modeler.html?modelId=${id}`)
    },
    handleDeploy([{ id }]) {
      this.$confirm('是否确认部署ID为"' + id + '"的模型?')
        .then(() => {
          deployModel(id).then(() => {
            this.$message.success('操作成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['activitiRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="activiti">
    <!-- 列表页 -->
    <base-page
      ref="activitiRef"
      :name="constant.TABLE_NAME_CUS_LEVYMODE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '150px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
