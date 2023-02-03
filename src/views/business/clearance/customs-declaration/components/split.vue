<script>
import { getOrderPageCustomsMaster, splitCustomsMasterByDetailIds, splitCustomsMasterByOrderIds } from '@/api/customs/customs-master'
import { getCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'Spilt',
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
        const { data } = await getCustomsMasterDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      customs: {
        waitColumns: [
          { field: 'contrItem', title: '备案序号', searchProps: { span: 8 } },
          { field: 'codeTS', title: '商品编号' },
          { field: 'hsName', title: '检验检疫名称' },
          { field: 'gName', title: '商品名称' },
          { field: 'gModel', title: '规格' },
          { field: 'gQty', title: '成交数量' },
          { field: 'gUnit', title: '成交单位' },
          {
            field: 'declPrice',
            align: 'right',
            title: '单价',
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          {
            field: 'declTotal',
            align: 'right',
            title: '总价',
            formatter: {
              type: 'number'
            }
          },
          { field: 'tradeCurr', title: '币制' },
          { field: 'originCountry', title: '原产国(地区)' },
          { field: 'destinationCountry', title: '最终目的国' },
          { field: 'dutyMode', title: '征免方式' }
        ],
        selectColumns: [
          { field: 'contrItem', title: '备案序号', width: 80 },
          { field: 'codeTS', title: '商品编号', width: 110 },
          { field: 'hsName', title: '检验检疫名称', width: 140 },
          { field: 'gName', title: '商品名称', width: 140 },
          { field: 'gModel', title: '规格', width: 200 },
          { field: 'gQty', title: '成交数量', width: 100 },
          { field: 'gUnit', title: '成交单位', width: 100 },
          {
            field: 'declPrice',
            title: '单价',
            width: 120,
            sum: true,
            formatter: {
              type: 'number',
              config: {
                precision: 6
              }
            },
            footerConfig: { precision: 6 }
          },
          { field: 'declTotal', title: '总价', width: 120 },
          { field: 'tradeCurr', title: '币制', width: 110 },
          { field: 'originCountry', title: '原产国(地区)', width: 140 },
          { field: 'destinationCountry', title: '最终目的国', width: 140 },
          { field: 'dutyMode', title: '征免方式', width: 140 }
        ]
      },
      order: {
        waitColumns: [
          { field: 'orderNo', title: '订单编号', searchProps: { span: 8 } },
          { field: 'customerName', title: '客户名称', searchProps: { span: 8 } },
          {
            field: 'receivingStatus',
            title: '入库状态',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_RECEIVING_STATUS)
              }
            },
            searchProps: { type: 'select', span: 8 }
          },
          {
            field: 'shippingStatus',
            title: '出库状态',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_STATUS)
              }
            },
            searchProps: { type: 'select', span: 8 }
          },
          { field: 'declareTitle', title: '抬头方式' },
          { field: 'incoterms', title: '成交方式' }
        ],
        selectColumns: [
          { field: 'orderNo', title: '订单编号', width: 160 },
          { field: 'customerName', title: '客户名称', width: 180 },
          {
            field: 'receivingStatus',
            title: '入库状态',
            width: 140,
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_RECEIVING_STATUS)
              }
            }
          },
          {
            field: 'shippingStatus',
            title: '出库状态',
            width: 140,
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_STATUS)
              }
            }
          },
          { field: 'declareTitle', title: '抬头方式', width: 140 },
          { field: 'incoterms', title: '成交方式', width: 140 }
        ]
      },
      waitColumns: [],
      activeName: '按报关明细拆单',
      lock: false
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.$nextTick(() => {
          this.waitColumns = this.customs.waitColumns
          this.request = async ({ pager, params }) => {
            const { data } = await getCustomsMasterDetail({
              ...pager,
              ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
            })
            return {
              data: data.records,
              total: data.total
            }
          }
          this.$refs.selectPageRef.loadColumns(this.customs.selectColumns)
        })
      } else {
        this.activeName = '按报关明细拆单'

        this.request = async ({ pager, params }) => {
          const { data } = await getCustomsMasterDetail({
            ...pager,
            ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
          })
          return {
            data: data.records,
            total: data.total
          }
        }
        // this.$refs.waitPageRef.refresh(false)
        // this.$refs.selectPageRef.loadColumns(this.customs.selectColumns)
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    async handleTableCheckboxChange(rows) {
      if (!this.lock) {
        this.$refs.selectPageRef.loadData(rows, 'cover')
      }
    },
    handleDelete(rows) {
      const data = this.$refs.waitPageRef.getRecords()
      rows.forEach(row => {
        const target = data.find(v => v.id === row.id)
        this.$refs.waitPageRef.setCheckboxRow(target || row, false)
      })
    },
    handleClick({ name }) {
      this.lock = true
      this.$refs.waitPageRef.handleTableClearCheckbox(true)
      this.$refs.selectPageRef.loadData([], 'cover')
      if (name === '按报关明细拆单') {
        this.waitColumns = this.customs.waitColumns
        this.request = async ({ pager, params }) => {
          const { data } = await getCustomsMasterDetail({
            ...pager,
            ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
          })
          return {
            data: data.records,
            total: data.total
          }
        }
        this.$refs.waitPageRef.refresh(false)
        this.$refs.selectPageRef.loadColumns(this.customs.selectColumns)
        this.lock = false
      } else {
        this.waitColumns = this.order.waitColumns
        this.request = async ({ pager, params }) => {
          const { data } = await getOrderPageCustomsMaster({
            ...pager,
            ...transforArrayPayload(Object.assign({ customsId: this.tableRow.id }, params))
          })
          return {
            data: data.records,
            total: data.total
          }
        }
        this.$refs.waitPageRef.refresh(false)
        this.$refs.selectPageRef.loadColumns(this.order.selectColumns)
        this.lock = false
      }
    },
    handleSave(done) {
      const selectedRows = this.$refs.selectPageRef.getRecords()
      if (!selectedRows.length) {
        this.$message.error(this.activeName === '按报关明细拆单' ? '请选择要拆分的报关单明细!' : '请选择要拆分的订单!')
        done()
        return
      }
      this.handleSubmit(selectedRows, done)
    },
    async handleSubmit(selectedRows, done) {
      try {
        if (this.activeName === '按报关明细拆单') {
          await splitCustomsMasterByDetailIds({
            customsId: this.tableRow.id,
            customsDetailIds: selectedRows.map(v => v.id).join(',')
          })
        } else {
          await splitCustomsMasterByOrderIds({
            customsId: this.tableRow.id,
            orderIds: selectedRows.map(v => v.orderIds).join(',')
          })
        }
        this.$message.success('操作成功')
        this.visible = false
        done()
        this.reLoad(true)
      } catch (error) {
        done()
      }
    }
  }
}
</script>

<template>
  <div>
    <base-dialog custom-class="split-dialog" fullscreen :visible.sync="visible" title="拆单" @save="handleSave">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="按报关明细拆单" name="按报关明细拆单" />
        <el-tab-pane label="按订单拆单" name="按订单拆单" />
      </el-tabs>
      <div class="split">
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
                labelWidth: '80px'
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
  </div>
</template>

<style lang="scss">
.split-dialog {
  .split {
    height: calc(100% - 54px);
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
