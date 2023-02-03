<script>
import { getCustomsMaster } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'HandleCustoms',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'bind'
    },
    tableRows: {
      type: Array,
      default: () => []
    },
    title: String,
    reLoad: Function,
    detailsMark: Boolean
  },
  data() {
    return {
      constant,
      visible: this.value,
      request: async ({ pager, params }) => {
        const { data } = await getCustomsMaster({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                transportId: this.type === 'bind' ? 0 : this.tableRows.map(v => v.id).join(','),
                IEFlag: this.tableRows[0].tradingType,
                entyPort: this.tableRows[0].entyPort,
                entyPortCode: this.tableRows[0].entyPortCode
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      waitColumns: [
        {
          field: 'declareStatus',
          title: '申报状态',
          searchProps: { span: 8, type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARATION_STATUS)
            }
          }
        },
        {
          field: 'manifestStatus',
          title: '舱单申报状态',
          searchProps: { span: 8, type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_MANIFEST_DECLARATION_STATUS)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: { type: 'input', span: 8 }, visible: false },
        {
          field: 'iEFlag',
          title: '进出口标志',
          searchProps: { span: 8, type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'declareDate', title: '申报日期', searchProps: { span: 8, type: 'date' } },
        { field: 'iEDate', title: '进出口日期' },
        { field: 'contrNo', title: '合同协议号', searchProps: { type: 'input', span: 8 } },
        { field: 'billNo', title: '提运单号', searchProps: { type: 'input', span: 8 } },

        {
          field: 'declareType',
          title: '申报类型',
          searchProps: { span: 8, type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_TYPE)
            }
          }
        },
        {
          field: 'helpCommit',
          title: '是否辅助申报',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'cargoListNo', title: '航次号' },
        { field: 'transportNo', title: '运输单号', searchProps: { type: 'input', span: 8 } },
        { field: 'entryId', title: '报关单号', searchProps: { type: 'input', span: 8 } },
        { field: 'declareTitle', title: '抬头方式' },
        { field: 'transMode', title: '成交方式' },
        { field: 'customerName', title: '客户名称', searchProps: { type: 'input', span: 8 } },
        { field: 'tradeName', title: '境内收发货人', searchProps: { type: 'input', span: 8 } },
        { field: 'overseasConsignorEname', title: '境外收发货人', searchProps: { type: 'input', span: 8 } },
        { field: 'agentName', title: '申报单位' },
        { field: 'tradeCurr', title: '报关币别' },
        { field: 'totalMoney', title: '申报总价', align: 'right' },
        { field: 'customsRate', title: '海关汇率' },
        { field: 'remark', title: '备注' }
      ],
      selectColumns: [
        {
          field: 'declareStatus',
          title: '申报状态',
          width: 120,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARATION_STATUS)
            }
          }
        },
        {
          field: 'manifestStatus',
          title: '舱单申报状态',
          width: 120,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_MANIFEST_DECLARATION_STATUS)
            }
          }
        },
        {
          field: 'iEFlag',
          title: '进出口标志',
          width: 120,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'declareDate', title: '申报日期', width: 150 },
        { field: 'iEDate', title: '进出口日期', width: 150 },
        { field: 'contrNo', title: '合同协议号', width: 150 },
        { field: 'billNo', title: '提运单号', width: 150 },
        {
          field: 'declareType',
          title: '申报类型',
          width: 120,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_TYPE)
            }
          }
        },
        {
          field: 'helpCommit',
          title: '是否辅助申报',
          width: 120,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'cargoListNo', title: '航次号', width: 150 },
        { field: 'transportNo', title: '运输单号', width: 150 },
        { field: 'entryId', title: '报关单号', width: 150 },
        { field: 'declareTitle', title: '抬头方式', width: 150 },
        { field: 'transMode', title: '成交方式', width: 150 },
        { field: 'customerName', title: '客户名称', width: 150 },
        { field: 'tradeName', title: '境内收发货人', width: 170 },
        { field: 'overseasConsignorEname', title: '境外收发货人', width: 170 },
        { field: 'agentName', title: '申报单位', width: 170 },
        { field: 'tradeCurr', title: '报关币别', width: 150 },
        { field: 'totalMoney', title: '申报总价', width: 150 },
        { field: 'customsRate', title: '海关汇率', width: 150 },
        { field: 'remark', title: '备注', width: 150 }
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
      this.$emit('save', this.$refs.selectPageRef.getRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="handle-customs-dialog" fullscreen :visible.sync="visible" :title="title" @save="handleSave">
    <div class="handle-customs">
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
.handle-customs-dialog {
  .handle-customs {
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
