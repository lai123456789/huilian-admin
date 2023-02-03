<!-- 流程管理 -->
<script>
import { getProcess, updateProcessStatusByProInsIdAndStatus, deleteProcessById } from '@/api/admin/process'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'Process',
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getProcess({ ...pager, ...transforArrayPayload(Object.assign({ descs: 'create_time' }, params)) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'processonDefinitionId', title: '流程ID' },
        { field: 'key', title: '模型标识' },
        { field: 'category', title: '流程分类', searchProps: true },
        { field: 'name', title: '模型名称' },
        { field: 'revision', title: '版本号' },
        {
          field: 'deploymentTime',
          title: '部署时间',
          formatter: {
            type: 'date',
            config: {
              valueFormat: 'YYYY-MM-DD HH:mm'
            }
          }
        },
        {
          title: '操作',
          width: '170px',
          align: 'center',
          fixed: 'right',
          render: (h, value, row) => {
            return (
              <div>
                <el-button type="text" size="mini" onClick={() => this.handleProcessPic(row)}>
                  流程图
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleActivate(row)}>
                  {this.handleActivateOrNot(row)}
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleDelete(row)}>
                  删除
                </el-button>
              </div>
            )
          }
        }
      ],
      buttonsConfig: {},
      helpConfig: {},
      visible: false,
      loadedProcess: false,
      actPicUrl: ''
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_SYS_PROCESS],
      mark: constant.PERMISSION_SYS_PROCESS
    }
    this.buttonsConfig = {}
  },
  methods: {
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteProcessById(row.deploymentId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['processRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleProcessPic({ deploymentId, processonDefinitionId }) {
      this.actPicUrl = ''
      this.loadedProcess = false
      this.actPicUrl = `/act/process/resource/${deploymentId}/${processonDefinitionId}/image`
      this.visible = true
    },
    handleLoadedProcess() {
      this.loadedProcess = true
    },
    handleActivate({ processonDefinitionId, suspend }) {
      this.$confirm(`是否确认操作ID为"${processonDefinitionId}"的流程?`)
        .then(() => {
          updateProcessStatusByProInsIdAndStatus(processonDefinitionId, suspend ? 'active' : 'suspend').then(() => {
            this.reLoad()
            this.$message.success('操作成功')
          })
        })
        .catch(() => {})
    },
    handleActivateOrNot(row) {
      const { suspend } = row
      return suspend ? '激活' : '挂起'
    },
    reLoad(isClearSelect) {
      this.$refs['processRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="process">
    <!-- 列表页 -->
    <base-page
      ref="processRef"
      key-field="deploymentId"
      :name="constant.TABLE_NAME_PROCESS"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '110px'
      }"
    />

    <!-- 流程图 -->
    <base-dialog :visible.sync="visible" title="流程图" width="70%" :show-footer="false">
      <img v-show="loadedProcess" class="process-img" :src="actPicUrl" @load="handleLoadedProcess" />
      <div
        v-if="!loadedProcess"
        v-loading="!loadedProcess"
        class="process-loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      ></div>
    </base-dialog>
  </div>
</template>
