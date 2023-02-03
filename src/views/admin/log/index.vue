<!-- 日志 -->
<script>
import { getLog, deleteLogById } from '@/api/admin/log'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'Log',
  data() {
    return {
      constant,
      visible: false,
      exception: '',
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getLog({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'type',
          title: '类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_LOG_TYPE)
            }
          },
          searchProps: { type: 'select', sort: 1 }
        },
        { field: 'title', title: '标题', searchProps: true },
        { field: 'requestUri', title: '请求路径', searchProps: true },
        { field: 'params', title: '请求参数', searchProps: true, textMaxColumnWidth: 200 },
        { field: 'remoteAddr', title: 'IP地址', searchProps: true },
        { field: 'method', title: '请求方式' },
        { field: 'serviceId', title: '客户端' },
        { field: 'time', title: '请求时间' },
        {
          field: 'exception',
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
        { field: 'createByName', title: '操作人', searchProps: true },
        {
          field: 'createTime',
          title: '操作时间',
          searchProps: {
            type: 'datetime',
            sort: 1
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
      show: this.permissions[constant.PERMISSION_SYS_LOG],
      mark: constant.PERMISSION_SYS_LOG
    }
    this.buttonsConfig = {
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_LOG_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteLogById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['logRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    openErrorDetails(row) {
      this.exception = row.exception
      this.visible = true
    },
    reLoad(isClearSelect) {
      this.$refs['logRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="log">
    <!-- 列表页 -->
    <base-page
      ref="logRef"
      :name="constant.TABLE_NAME_SYS_LOG"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />

    <base-dialog custom-class="log-error-dialog" :visible.sync="visible" width="80%" title="错误日志详情" :show-footer="false">
      <base-form size="small">
        <base-row>
          <base-col :span="24">
            <base-form-item>
              <base-input v-model="exception" type="textarea" :autosize="{ minRows: 25 }" />
            </base-form-item>
          </base-col>
        </base-row>
      </base-form>
    </base-dialog>
  </div>
</template>

<style lang="scss">
.log-error-dialog {
  .el-form-item__content {
    width: 100%;
  }
}
</style>
