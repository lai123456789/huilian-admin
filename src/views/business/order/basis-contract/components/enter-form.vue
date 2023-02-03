<script>
import { getOrderBasisContractById, saveOrderBasisContract, updateOrderBasisContract } from '@/api/order/order-basis-contract'
import { getOrderAgentPurchaseById } from '@/api/order/order-agent-purchase'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'

const form = {
  contractNo: '',
  orderType: enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE'),
  orderId: 0,
  orderNo: '',
  contractDate: '',
  totalMoney: 0,
  remark: ''
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    rows: Array,
    tableRow: {
      type: Object,
      default: () => ({})
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {
        contractNo: [{ required: true, message: '基差合同编号必填' }],
        contractDate: [{ required: true, message: '合同日期必填' }],
        orderNo: [{ required: true, message: '订单编号必填' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_ORDER_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_ORDER_TYPE]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getOrderBasisContractById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.getDetailsEditTableInstance().loadData(this.form.orderBasisContractDetailVOList || [], 'cover')
          }
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    /** 明细列数据 */
    handleColumns() {
      return [
        { field: 'productName', title: '品名', width: 120 },
        { field: 'productModel', title: '型号', width: 120 },
        { field: 'productBrand', title: '品牌', width: 120 },
        { field: 'productUnit', title: '单位', width: 100 },
        { field: 'qty', title: '数量', width: 100 },
        {
          field: 'basis',
          width: 120,
          title: '基差',
          type: 'inputNumber',
          rules: [{ required: true, message: '基差必填' }],
          sum: true
        },
        {
          field: 'point',
          width: 120,
          title: '成交点位',
          type: 'inputNumber',
          rules: [{ required: true, message: '成交点位必填' }],
          sum: true
        },
        {
          field: 'price',
          width: 120,
          title: '成交单价',
          type: 'inputNumber',
          rules: [{ required: true, message: '成交单价必填' }],
          sum: true,
          attrs: {
            precision: 6
          },
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 },
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'price')
          }
        },
        {
          field: 'totalMoney',
          width: 120,
          title: '成交总价',
          type: 'inputNumber',
          rules: [{ required: true, message: '成交总价必填' }],
          sum: true,
          on: {
            blur: (v, column, scope) => this.calcPrice(v, column, scope, 'totalMoney')
          }
        },
        { field: 'remark', title: '备注', width: 120, type: 'input' }
      ]
    },
    async handleOrderNoSelect(rows) {
      const { id } = rows[0]
      this.form.orderId = id
      const res = await getOrderAgentPurchaseById(id)
      if (res.data) {
        const { orderAgentPurchaseDetailVOList } = res.data
        if (orderAgentPurchaseDetailVOList.length > 0) {
          await this.getDetailsEditTableInstance().loadData(orderAgentPurchaseDetailVOList, 'cover')
          // 算成交总金额
          this.clacTotalMoney(orderAgentPurchaseDetailVOList)
        }
      }
    },
    async handleOrderNoClear() {
      this.form.orderId = 0
      const tableData = await this.getDetailsEditTableInstance().loadData([], 'cover')
      this.clacTotalMoney(tableData)
    },
    clacTotalMoney(tableData) {
      this.form.totalMoney = tableData.reduce((total, row) => {
        return new BigNumber(total).plus(row.totalMoney).dp(2).toNumber()
      }, 0)
    },
    handleTableDelete() {
      const tableData = this.getDetailsEditTableInstance().getRecords()
      this.clacTotalMoney(tableData)
    },
    calcPrice(v, column, scope, type) {
      const { row } = scope
      if (type === 'totalMoney') {
        if (row.qty) {
          row.price = new BigNumber(row.totalMoney).div(row.totalMoney).dp(6).toNumber()
        }
      } else {
        row.totalMoney = new BigNumber(row.qty).times(row.price).dp(2).toNumber()
      }
      this.handleTableDelete()
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`基差合同明细: 第${rowIndex}行 ${rule.message}`)
            }
            const orderBasisContractDetailDTOList = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign(
              {
                orderBasisContractDetailDTOList: orderBasisContractDetailDTOList.map(v => ({
                  orderDetailId: v.orderDetailId || v.id,
                  basis: v.basis,
                  point: v.point,
                  price: v.price,
                  totalMoney: v.totalMoney
                }))
              },
              this.form
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveOrderBasisContract(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                  this.visible = false
                  done()
                  this.reLoad(false)
                })
                .catch(() => {
                  done()
                })
            } else {
              updateOrderBasisContract(formData)
                .then(() => {
                  this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                  this.visible = false
                  done()
                  // 刷新表格的时候，保存之前选中的数据
                  this.reLoad(true)
                })
                .catch(() => {
                  done()
                })
            }
          })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    },
    getDetailsEditTableInstance() {
      return this.$refs.detailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    :visible.sync="visible"
    width="99%"
    custom-class="common-form-dialog basis-contract-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="订单类型" prop="orderType">
              <base-select
                v-model="form.orderType"
                placeholder="请选择订单类型"
                :clearable="false"
                :options="dicts[constant.DICTS_ORDER_TYPE]"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="订单编号" prop="orderNo">
              <business-autocomplete-basic
                v-model="form.orderNo"
                label="订单编号"
                placeholder="请输入订单编号"
                :params="{
                  auditStatus: enums.AUDIT_STATUS.getFieldByKey('PASS'),
                  basisFlag: enums.WHETHER_STATUS.getFieldByKey('YES')
                }"
                :module-name="constant.AUTOCOMPLETE_KEY_AGENT_PURCHASE_ORDER"
                @select="handleOrderNoSelect"
                @clear="handleOrderNoClear"
              ></business-autocomplete-basic>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="基差合同编号" prop="contractNo">
              <base-input v-model="form.contractNo" placeholder="请输入基差合同编号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="合同日期" prop="contractDate">
              <base-date-picker v-model="form.contractDate" type="date" placeholder="选择合同日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="成交总金额" prop="totalMoney">
              <base-input-number v-model="form.totalMoney" readonly />
            </base-form-item>
          </base-col>
        </base-row>

        <base-row :gutter="10">
          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 基差合同明细 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基差合同明细
        </span>
        <base-edit-table
          ref="detailsEditTableRef"
          height="300px"
          :show-added="false"
          show-footer
          :name="constant.TABLE_NAME_BASIS_ORDER_ENTER"
        />
      </div>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.basis-contract-dialog {
  .common-form-block {
    &.is-special {
      box-sizing: border-box;
      padding-bottom: 10px;
      .common-form-block-header {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
