<script>
import { getMergeCustomsPageCustomsMaster, mergeCustomsMasterCustomsMaster } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'MergeBill',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: Object,
    reLoad: Function
  },
  data() {
    return {
      constant,
      visible: this.value,
      request: async ({ pager, params }) => {
        const { data } = await getMergeCustomsPageCustomsMaster({
          ...pager,
          ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      waitColumns: [
        { field: 'preEntryId', title: '报关单号', searchProps: { span: 8, type: 'input' }, visible: false },
        { field: 'seqNo', title: '统一编号', searchProps: { span: 8, type: 'input' } },
        { field: 'entryId', title: '海关编号' },
        { field: 'tradeName', title: '境内收发货人', searchProps: { span: 8, type: 'input' } },
        { field: 'ownerCodeScc', title: '境内收发货人社会信用代码' },
        { field: 'billNo', title: '提运单号', searchProps: { span: 8, type: 'input' } },
        { field: 'iEDate', title: '进出口日期' },
        { field: 'tradeMode', title: '监管方式' },
        { field: 'contrNo', title: '合同协议号' },
        { field: 'trafName', title: '运输工具名称' },
        { field: 'declareStatus', title: '通关状态' },
        { field: 'agentName', title: '申报单位名称' },
        {
          field: 'iEFlag',
          title: '进出口标志',
          searchProps: { type: 'select', span: 8 },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'declareDate', title: '申报日期', searchProps: { type: 'date', span: 8 }, visible: false },
        { field: 'customMaster', title: '申报地海关', searchProps: { span: 8 } },
        { field: 'entyPort', title: '入境/离境口岸' },
        { field: 'containerQty', title: '集装箱数量' }
      ],
      selectColumns: [
        { field: 'seqNo', title: '统一编号', width: 150 },
        { field: 'entryId', title: '海关编号', width: 150 },
        { field: 'tradeName', title: '境内收发货人', width: 150 },
        { field: 'ownerCodeScc', title: '境内收发货人社会信用代码', width: 180 },
        { field: 'billNo', title: '提运单号', width: 150 },
        { field: 'iEDate', title: '进出口日期', width: 150 },
        { field: 'tradeMode', title: '监管方式', width: 150 },
        { field: 'contrNo', title: '合同协议号', width: 150 },
        { field: 'trafName', title: '运输工具名称', width: 150 },
        { field: 'declareStatus', title: '通关状态', width: 150 },
        { field: 'agentName', title: '申报单位名称', width: 150 },
        {
          field: 'iEFlag',
          title: '进出口标志',
          width: 150,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'customMaster', title: '申报地海关', width: 150 },
        { field: 'entyPort', title: '入境/离境口岸', width: 150 },
        { field: 'containerQty', title: '集装箱数量', width: 150 }
      ]
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.$nextTick(() => {
          this.$refs.selectPageRef.loadColumns(this.selectColumns)
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    async handleTableCheckboxChange(rows) {
      this.$refs.selectPageRef.loadData(rows, 'cover')
    },
    handleDelete(rows) {
      const data = this.$refs.waitPageRef.getRecords()
      rows.forEach(row => {
        const target = data.find(v => v.id === row.id)
        this.$refs.waitPageRef.setCheckboxRow(target || row, false)
      })
    },
    handleSave(done) {
      const selectedRows = this.$refs.selectPageRef.getRecords()
      mergeCustomsMasterCustomsMaster({ customsId: this.tableRow.id, customsIds: selectedRows.map(v => v.id).join(',') })
        .then(() => {
          this.$message.success('操作成功')
          this.visible = false
          done()
          this.reLoad()
        })
        .catch(() => {
          done()
        })
    }
  }
}
</script>

<template>
  <base-dialog custom-class="merge-bill-dialog" fullscreen :visible.sync="visible" title="拼单" @save="handleSave">
    <div class="merge-bill">
      <div class="wait-page">
        <el-card class="box-card" header="待选区">
          <base-page
            ref="waitPageRef"
            :name="constant.TABLE_NAME_CUSTOMS_BIDN_WAIT"
            :reserve="true"
            :tools-config="{
              setting: {
                visible: false
              },
              download: {
                visible: false
              }
            }"
            :search-config="{
              foldCount: 2,
              span: 8,
              btnsSpan: 8,
              labelWidth: '125px'
            }"
            :columns="waitColumns"
            :request="request"
            @table-checkbox-change="handleTableCheckboxChange"
          />
        </el-card>
      </div>
      <div class="select-page">
        <el-card class="box-card" header="已选区">
          <base-edit-table
            ref="selectPageRef"
            key-field="id"
            :show-added="false"
            :show-delete="false"
            :name="constant.TABLE_NAME_CUSTOMS_BIDN_SELECT"
          >
            <template v-slot:buttons="{ selectRecords }">
              <el-button size="mini" type="danger" @click="handleDelete(selectRecords)">删除</el-button>
            </template>
          </base-edit-table>
        </el-card>
      </div>
    </div>
  </base-dialog>
</template>

<style lang="scss">
.merge-bill-dialog {
  .merge-bill {
    height: 100%;
    .el-card {
      height: 100%;
    }
    .el-card__header {
      padding: 12px 15px;
    }
    .el-card__body {
      padding: 0;
      height: calc(100% - 46px);
    }
  }
  .wait-page {
    display: inline-block;
    padding-right: 10px;
    width: 66%;
    height: 100%;
    box-sizing: border-box;
  }
  .select-page {
    display: inline-block;
    width: 34%;
    height: 100%;
    box-sizing: border-box;
    vertical-align: top;
    .el-card__body {
      padding: 10px 0;
    }
  }
}
</style>
