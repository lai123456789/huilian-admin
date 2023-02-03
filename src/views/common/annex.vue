<!-- 附件 -->
<script>
import { url as fileUrl, getFile, delSysFile } from '@/api/admin/sys-file'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload, fileDownload, filePrevie } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormAnnex from './components/enter-form-annex'
import { mapGetters } from 'vuex'
import BigNumber from '@/utils/big-number'

export default {
  name: 'Annex',
  components: { EnterFormAnnex },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    annexConfig: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getFile({
          ...pager,
          ...transforArrayPayload(
            Object.assign({ fileModule: this.annexConfig.fileModule, recordId: this.tableRow[this.annexConfig.recordKey || 'id'] }, params)
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'original',
          title: '附件名称'
        },
        {
          field: 'fileType',
          title: '附件类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(this.annexConfig.fileTypeName)
            }
          }
        },
        {
          field: 'fileSize',
          title: '文件大小',
          formatter(value) {
            return `${Math.ceil(BigNumber(Number(value)).div(1024).toNumber())} kb`
          }
        },
        { field: 'remark', title: '备注' },
        { field: 'createUser', title: '上传人' },
        { field: 'createTime', title: '创建时间' },
        {
          title: '操作',
          width: '150px',
          align: 'center',
          fixed: 'right',
          render: (h, value, row) => {
            return (
              <div>
                <el-button type="text" size="mini" onClick={() => this.handleDownload(row)}>
                  下载
                </el-button>
                {this.visiblePreView(row) && (
                  <el-button type="text" size="mini" onClick={() => this.handlePreView(row)}>
                    预览
                  </el-button>
                )}
              </div>
            )
          }
        }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      add: {
        label: '上传',
        visible: this.permissions[this.annexConfig.permissionsAnnex.add],
        handler: this.handleAdded
      },
      del: {
        visible: this.permissions[this.annexConfig.permissionsAnnex.del],
        multiple: true,
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
    handleDel(rows) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          delSysFile({ ids: rows.map(row => row.id) }).then(() => {
            // 清空表格全部选中的数据
            this.$refs['annexRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    async handleDownload(row) {
      const { fileName, bucketName, original } = row
      fileDownload(`${fileUrl}/${bucketName}/${fileName}`, {}, original)
    },
    visiblePreView(row) {
      const typeArr = ['jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF', 'png', 'PNG', 'pdf', 'PDF']
      return typeArr.includes(row.type)
    },
    handlePreView(row) {
      const { fileName, bucketName } = row
      filePrevie({ path: `${bucketName}/${fileName}`, fileName })
    },
    reLoad(isClearSelect) {
      this.$refs['annexRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="annex">
    <!-- 列表页 -->
    <base-page
      ref="annexRef"
      :name="constant.TABLE_NAME_ANNEX"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '105px'
      }"
    />
    <enter-form-annex
      v-model="enterForm.visible"
      :type="enterForm.type"
      :file-module="annexConfig.fileModule"
      :record-key="annexConfig.recordKey"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
