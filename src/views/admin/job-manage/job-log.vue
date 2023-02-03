<!-- Quatz日志 -->
<script>
import { getSysJobLog } from '@/api/admin/job-log'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'JobLog',
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getSysJobLog({
          ...pager,
          ...transforArrayPayload(Object.assign({ jobId: this.tableRow.jobId }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'jobName', title: '任务名称' },
        { field: 'jobGroup', title: '任务组名' },
        {
          field: 'jobLogStatus',
          title: '状态',
          search: true,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_JOB_EXEUTE_STATUS)
            }
          }
        },
        {
          field: 'jobType',
          title: '类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_LOG_TYPE)
            }
          }
        },
        { field: 'className', title: '执行文件' },
        { field: 'methodName', title: '执行方法' },
        { field: 'cronExpression', title: 'cron表达式' },
        { field: 'jobMessage', title: '状态描述' },
        { field: 'executeTime', title: '执行时间(ms)' },
        {
          field: 'exceptionInfo',
          title: '异常信息',
          width: 300,
          align: 'center',
          render: (h, value, row) => {
            return value && value !== '' ? (
              value.length >= 50 ? (
                <el-button size="mini" type="danger" onClick={() => this.openErrorDetails(row)}>
                  查看
                </el-button>
              ) : (
                <span>{value}</span>
              )
            ) : (
              ''
            )
          }
        },
        { field: 'createTime', title: '开始时间' }
      ],
      buttonsConfig: {},
      visible: false,
      exceptionInfo: '' // 错误日志的信息
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {}
  },
  methods: {
    openErrorDetails(row) {
      this.exceptionInfo = row.exceptionInfo
      this.visible = true
    }
  }
}
</script>

<template>
  <div class="stock-match">
    <!-- 列表页 -->
    <base-page
      ref="stockMatchRef"
      :name="constant.TABLE_NAME_STOCK_MATCH"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />

    <base-dialog :visible.sync="visible" width="80%" title="错误日志详情" :show-footer="false">
      <base-form class="custom-form" size="mini">
        <base-form-item>
          <base-input v-model="exceptionInfo" type="textarea" :autosize="{ minRows: 25 }" />
        </base-form-item>
      </base-form>
    </base-dialog>
  </div>
</template>
