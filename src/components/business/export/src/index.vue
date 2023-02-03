<script>
import { request as apiRequest } from '@/api'
import { ureportUrl, jmPdfUrl, jmExcelUrl } from '@/api/admin/report'
import constant from '@/constant'
import enums from '@/enums'
import { serialize } from 'xe-utils'
import { fileDownload } from '@/utils'
import { getStorage } from '@/utils/storage'
import EnterForm from './components/enter-form'

export default {
  name: 'BusinessExport',
  components: { EnterForm },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    request: {
      type: Function,
      required: true
    },
    tableRows: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '导出'
    }
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      columns: [
        {
          field: '_n',
          title: '文件名称'
        },
        {
          title: '导出格式',
          width: '170px',
          align: 'center',
          fixed: 'right',
          render: (h, value, row) => {
            return (
              <div>
                <el-button type="text" size="mini" onClick={() => this.exportCorresFormat('preview', row)}>
                  预览
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.exportCorresFormat('pdf', row)}>
                  pdf
                </el-button>
                <el-button type="text" size="mini" onClick={() => this.exportCorresFormat('excel', row)}>
                  excel
                </el-button>
              </div>
            )
          }
        }
      ],
      enterForm: {
        visible: false,
        rows: []
      },
      tableRequest: null,
      showPage: false,
      buttonsConfig: {
        mores: [
          {
            label: '合并导出Excel',
            visible: true,
            multiple: true,
            handler: this.handleBatchExportExcel
          }
        ]
      },
      loading: false
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.init()
      } else {
        this.showPage = false
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    async init() {
      const tableData = []
      this.loading = true
      const { data } = await this.request()

      // 处理根据的 metadata.hidden 去过滤数据
      const results = data.filter(v => {
        const metadata = JSON.parse(v.metadata)
        const condition = Object.keys(metadata).length > 0 ? this.handleMetadataHidden(metadata.hidden || {}) : {}
        return metadata.hidden
          ? Object.keys(condition).every(key => {
              return String(metadata['hidden'][key]).toLowerCase().includes(String(condition[key]).trim().toLowerCase())
            })
          : true
      })

      results.forEach(v => {
        const fileName = this.handleExportFileName(v.exportFileName, this.tableRows)
        tableData.push(
          Object.assign(
            { reportId: v.id, _n: fileName, _u: v.sourceFileName, reportType: v.exportType },
            this.handleReqParam(v.reqParam, this.tableRows)
          )
        )
      })
      this.tableRequest = async () => {
        return {
          data: tableData,
          total: tableData.length
        }
      }
      this.showPage = true
    },
    handleMetadataHidden(obj) {
      const result = {}
      for (const k in obj) {
        result[k] = this.tableRows[0][k]
      }
      return result
    },
    handleBatchExportExcel(rows) {
      this.enterForm = {
        visible: true,
        rows
      }
    },
    async exportCorresFormat(type, row) {
      // UReport
      if (row.reportType === '0') {
        const { _n } = row
        const paramsStr = serialize(Object.assign({ type }, row))
        if (type === 'preview') {
          window.open(`/#/ureport/show${paramsStr ? '?' : ''}${paramsStr}`)
        } else {
          fileDownload(`${ureportUrl}${type}?${paramsStr}`, {}, type === 'pdf' ? `${_n}.pdf` : `${_n}.xlsx`)
        }
      } else {
        const { _u, _n } = row
        const paramsStr = serialize(Object.assign({ reportId: _u, type }, row))
        if (type === 'preview') {
          window.open(`/#/jmreport/view?${paramsStr}`)
        } else {
          let response = {}
          if (type === 'pdf') {
            response = await apiRequest.post(
              jmPdfUrl,
              {
                excelConfigId: _u,
                queryParam: {
                  token: `Bearer ${getStorage({ name: constant.STORAGE_ACCESS_TOKEN })}`
                }
              },
              { responseType: 'blob' }
            )
          } else {
            response = await apiRequest.post(
              jmExcelUrl,
              {
                excelConfigId: _u,
                queryParam: {
                  token: `Bearer ${getStorage({ name: constant.STORAGE_ACCESS_TOKEN })}`
                }
              },
              { responseType: 'blob' }
            )
          }
          fileDownload(`${ureportUrl}${type}?${paramsStr}`, {}, type === 'pdf' ? `${_n}.pdf` : `${_n}.xlsx`, false, new Blob([response]))
        }
      }
    },
    /** 处理参数字符串 */
    handleReqParam(reqParam, rows) {
      const reqParams = reqParam.split(',')
      const params = {}

      reqParams.forEach(v => {
        /* 如果是ids的话,  */
        if (v === 'ids') {
          params['ids'] = rows.map(row => row.id).join(',')
        } else {
          params[v] = rows[0][v]
        }
      })

      return params
    },
    /** 处理导出文件名 */
    handleExportFileName(exportFileName, rows) {
      return exportFileName.replace(/\$\{([^)]*?)\}/g, (x, y) => {
        return `${rows[0][y]}`
      })
    },
    hadnleTableloaded() {
      this.loading = false
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    :loading="loading"
    width="700px"
    custom-class="business-export-dialog"
    :title="title"
    :show-footer="false"
  >
    <base-page
      v-if="showPage"
      ref="businessExportRef"
      key-field="reportId"
      height="400px"
      :name="constant.TABLE_NAME_BUSINESS_EXPORT"
      :columns="columns"
      :request="tableRequest"
      :show-pager="false"
      :buttons-config="buttonsConfig"
      :tools-config="{
        setting: {
          visible: false
        },
        download: {
          visible: false
        },
        refresh: {
          visible: false
        }
      }"
      @table-loaded="hadnleTableloaded"
    />
    <enter-form v-model="enterForm.visible" :table-rows="enterForm.rows" />
  </base-dialog>
</template>

<style lang="scss">
.business-export-dialog {
  .base-dialog-body {
    padding: 0;
  }
}
</style>
