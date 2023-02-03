<!-- 定时任务 -->
<script>
import {
  getSysJob,
  deleteJobById,
  shutdownSysJob,
  shutdownSysJobSingle,
  startSysJob,
  startSysJobSingle,
  refreshSysJob,
  runSysJob
} from '@/api/admin/job'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { mapGetters } from 'vuex'

export default {
  name: 'JobManage',
  components: { EnterForm, Drawer },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getSysJob({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [],
      buttonsConfig: {},
      helpConfig: {},
      permissionsBtn: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_JOB_SYS_JOB],
      mark: constant.PERMISSION_JOB_SYS_JOB
    }
    this.buttonsConfig = {
      mores: [
        {
          label: '新建任务',
          visible: this.permissions[constant.PERMISSION_JOB_SYS_JOB_ADD],
          noNeedRows: true,
          handler: this.handleAdded
        },
        {
          label: '暂停全部任务',
          visible: this.permissions[constant.PERMISSION_JOB_SYS_JOB_SHUTDOWN_JOB],
          type: 'warning',
          noNeedRows: true,
          handler: this.shutdownJobs
        },
        {
          label: '启动全部任务',
          visible: this.permissions[constant.PERMISSION_JOB_SYS_JOB_START_JOB],
          type: 'success',
          noNeedRows: true,
          handler: this.startJobs
        },
        {
          label: '重置全部任务',
          visible: this.permissions[constant.PERMISSION_JOB_SYS_JOB_REFRESH_JOB],
          type: 'danger',
          noNeedRows: true,
          handler: this.refreshJobs
        }
      ]
    }
    this.permissionsBtn = {
      startJob: this.permissions[constant.PERMISSION_JOB_SYS_JOB_START_JOB],
      shutdownJob: this.permissions[constant.PERMISSION_JOB_SYS_JOB_SHUTDOWN_JOB],
      edit: this.permissions[constant.PERMISSION_JOB_SYS_JOB_EDIT],
      del: this.permissions[constant.PERMISSION_JOB_SYS_JOB_DEL],
      runJob: this.permissions[constant.PERMISSION_JOB_SYS_JOB_RUN_JOB]
    }
  },
  methods: {
    handlePageBeforeLoad() {
      this.columns = [
        { field: 'jobName', title: '任务名称', searchProps: true },
        { field: 'jobGroup', title: '任务组名', searchProps: true },
        {
          field: 'jobStatus',
          title: '任务状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_JOB_STATUS)
            }
          }
        },
        {
          field: 'jobExecuteStatus',
          title: '执行状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_JOB_EXEUTE_STATUS)
            }
          }
        },
        { field: 'startTime', title: '首次执行时间' },
        { field: 'previousTime', title: '上次执行时间' },
        { field: 'nextTime', title: '下次执行时间' },
        {
          field: 'jobType',
          title: '类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_JOB_TYPE)
            }
          }
        },
        { field: 'executePath', title: '执行路径' },
        { field: 'className', title: '执行文件' },
        { field: 'methodName', title: '执行方法' },
        { field: 'methodParamsValue', title: '执行参数值' },
        { field: 'cronExpression', title: 'cron表达式' },
        {
          field: 'misfirePolicy',
          title: '错失执行策略',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_MISFIRE_POLICY)
            }
          }
        },
        { field: 'remark', title: '备注信息' },
        {
          title: '操作',
          width: '220px',
          align: 'center',
          fixed: 'right',
          render: (h, value, row) => {
            return (
              <div>
                <el-button type="text" size="mini" onClick={() => this.handleStartJob(row)}>
                  启动
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleShutDownJob(row)}>
                  暂停
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleEdit(row)}>
                  修改
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleRunJob(row)}>
                  执行
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.handleDelete(row)}>
                  删除
                </el-button>
              </div>
            )
          }
        }
      ]
      return Promise.resolve()
    },
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
          deleteJobById(row.jobId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['jobManageRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      this.tableRow = row
      this.details = {
        visible: true,
        title: ''
      }
    },
    // 暂停全部任务
    shutdownJobs() {
      this.$confirm('即将暂停全部运行中定时任务, 是否继续?')
        .then(() => {
          shutdownSysJob().then(res => {
            this.reLoad()
            this.$message.success(res.data)
          })
        })
        .catch(() => {})
    },
    // 启动全部任务
    startJobs() {
      this.$confirm('即将启动全部暂定中定时任务, 是否继续?')
        .then(() => {
          startSysJob().then(() => {
            this.reLoad()
            this.$message.success('启动成功')
          })
        })
        .catch(() => {})
    },
    // 重置全部任务
    refreshJobs() {
      this.$confirm('即将刷新全部定时任务, 是否继续?')
        .then(() => {
          refreshSysJob().then(() => {
            this.reLoad()
            this.$message.success('重置成功')
          })
        })
        .catch(() => {})
    },
    // 启动单个任务
    handleStartJob(row) {
      const jobStatus = row.jobStatus
      if (jobStatus === enums.JOB_STATUS.getFieldByKey('RELEASED') || jobStatus === enums.JOB_STATUS.getFieldByKey('STOP')) {
        this.$confirm('即将发布或启动单个任务, 是否继续?')
          .then(() => {
            startSysJobSingle(row.jobId).then(() => {
              this.reLoad()
              this.$message.success('启动成功')
            })
          })
          .catch(() => {})
      } else {
        this.$message.error('定时任务已运行')
      }
    },
    // 暂停单个任务
    handleShutDownJob(row) {
      const jobStatus = row.jobStatus
      if (jobStatus === enums.JOB_STATUS.getFieldByKey('IN_SERVICE')) {
        this.$confirm('即将暂停单个任务, 是否继续?')
          .then(() => {
            shutdownSysJobSingle(row.jobId).then(() => {
              this.reLoad()
              this.$message.success('暂停成功')
            })
          })
          .catch(() => {})
      } else {
        this.$message.error('已暂停，不要重复操作')
      }
    },
    // 执行单个任务
    handleRunJob(row) {
      this.$confirm('立刻执行一次任务, 是否继续?')
        .then(() => {
          runSysJob(row.jobId).then(() => {
            this.reLoad()
            this.$message.success('执行成功')
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['jobManageRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="job-manage">
    <!-- 列表页 -->
    <base-page
      ref="jobManageRef"
      key-field="jobId"
      :name="constant.TABLE_NAME_JOB_MANAGE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :before-load="handlePageBeforeLoad"
      :search-config="{
        labelWidth: '110px'
      }"
      @cell-dblclick="openDetails"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad"></drawer>
  </div>
</template>
