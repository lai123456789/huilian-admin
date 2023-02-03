<!-- 凭证管理 -->
<script>
import { getBaseVoucherTemplateByBusinessPage, getBaseVoucherTemplateByTemplateNo } from '@/api/base/base-voucher-template'
import { saveAcctVoucher, deleteAcctVoucherById } from '@/api/finance/acct-voucher'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import variables from '@/styles/variables.scss'
import Voucher from './components/voucher'

export default {
  components: { Voucher },
  data() {
    this.presetColor = {
      $primary: variables.themeColor,
      $danger: variables.dangerColor,
      $warning: variables.warningColor,
      $success: variables.successColor,
      $info: variables.infoColor
    }
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      showPage: false,
      request: null,
      columns: [],
      tableName: '',
      buttonsConfig: {},
      tableConfig: {},
      voucher: {
        visible: false,
        row: {}
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    const { params } = this.$route
    this.buttonsConfig = {
      mores: [
        {
          visible: true,
          label: '查看',
          handler: this.handleViewr
        },
        {
          visible: true,
          label: '生成',
          multiple: true,
          handler: this.handleCreate
        },
        {
          visible: true,
          label: '删除',
          type: 'danger',
          multiple: true,
          handler: this.handleDelete
        }
      ]
    }
    getBaseVoucherTemplateByTemplateNo({ templateNo: params.templateNo }).then(res => {
      this.templateNo = params.templateNo
      if (res.data) {
        const { metadata } = res.data
        try {
          const config = JSON.parse(metadata)
          const { tableConfig, requestConfig, columns } = this.handleConfig(config)

          this.request = async ({ pager, params }) => {
            const { data } = await getBaseVoucherTemplateByBusinessPage({
              ...pager,
              ...transforArrayPayload(Object.assign(requestConfig.params, { templateNo: this.templateNo, recordId: '' }, params))
            })
            return {
              data: data ? data.records : [],
              total: data ? data.total : 0
            }
          }

          this.tableConfig = tableConfig
          this.columns = columns
          this.tableName = `VOUCHER_TEMPLATE_${params.templateNo}`

          this.showPage = true
        } catch (error) {
          console.error('[metadata]JSON转换错误:', error)
        }
      } else {
        this.request = async () => {
          return {
            data: [],
            total: 0
          }
        }
        this.showPage = true
      }
    })
  },
  methods: {
    handleConfig(config) {
      const { requestConfig, tableConfig, columns } = config
      const newColumn = columns.map(column => {
        const resultColumn = column

        if (Object.hasOwnProperty.call(column, 'formatter')) {
          const formatterColumn = column['formatter']
          Object.assign(
            resultColumn,
            formatterColumn.type === 'options'
              ? {
                  formatter: {
                    type: 'options',
                    config: {
                      options: () => getDataDictionary(formatterColumn.config.typeName)
                    }
                  }
                }
              : {}
          )
        }

        // 颜色的配置
        if (Object.hasOwnProperty.call(column, 'color')) {
          const color = column['color']
          if (color.type && color.type === 'options' && color.value) {
            Object.assign(resultColumn, {
              color: (value, row, column) => {
                const raw = row[column.field]
                const target = color.value[raw] ? this.presetColor[color.value[raw][0]] : false
                return color.value[raw] ? target || color.value[raw][0] : false
              }
            })
          } else if (color.type && color.type === 'text' && color.value) {
            return color.value
          }
        }
        return resultColumn
      })

      return {
        columns: newColumn,
        requestConfig: {
          params: requestConfig ? requestConfig.params : {}
        },
        tableConfig
      }
    },
    handleViewr(rows) {
      this.voucher = {
        visible: true,
        row: Object.assign({ templateNo: this.templateNo }, rows[0])
      }
    },
    handleCreate(rows) {
      saveAcctVoucher({
        templateNo: this.templateNo,
        recordIds: rows.map(v => v.record_id).join(',')
      }).then(() => {
        this.reLoad()
        this.$message.success('操作成功')
      })
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctVoucherById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['acctVoucherRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['acctVoucherRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="acct-voucher">
    <!-- 列表页 -->
    <base-page
      v-if="showPage"
      ref="acctVoucherRef"
      v-bind="tableConfig"
      :name="tableName"
      key-field="record_id"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '110px'
      }"
    />
    <voucher :visible.sync="voucher.visible" :row="voucher.row"></voucher>
  </div>
</template>
