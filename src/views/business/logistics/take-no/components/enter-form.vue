<script>
import { getWareDeliveryTakeById, saveWareDeliveryTake, updateWareDeliveryTake } from '@/api/warehouse/ware-delivery-take'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import DetailsCreate from './details-create'

const form = {
  warehouseId: 0,
  warehouseName: '',
  plateNo: '',
  person: '',
  takeDate: '',
  takePerson: '',
  takeIdCard: '',
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { DetailsCreate },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },

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
        warehouseName: [{ required: true, message: '仓库必填' }]
      },
      dicts: {},
      detailsCreate: {
        visible: false,
        params: {}
      }
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        Promise.all([
          getDataDictionary([]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getWareDeliveryTakeById(this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts
          this.$nextTick(() => {
            this.getDetailsEditTableInstance().loadColumns(this.handleColumns()[0])
          })
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.getDetailsEditTableInstance().loadData(this.form.wareShippingVOList || [], 'cover')
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
        // 出库单
        [
          { field: 'shippingNo', title: '出库编号', width: 140 },
          {
            field: 'orderType',
            title: '订单类型',
            width: 140,
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_SHIPPING_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '订单编号', width: 160 },
          { field: 'customerName', title: '客户名称', width: 160 },
          { field: 'totalQty', title: '总数量', width: 120, sum: true, footerConfig: { precision: 6 } },
          { field: 'totalPackages', title: '总件数', width: 120, sum: true, footerConfig: { precision: 6 } },
          { field: 'totalGrossWeight', title: '总毛重', width: 120, sum: true, footerConfig: { precision: 6 } },
          { field: 'totalNetWeight', title: '总净重', width: 120, sum: true, footerConfig: { precision: 6 } },
          { field: 'deliveryAddress', title: '送货地址', width: 140 },
          { field: 'deliveryCompany', title: '收货公司', width: 170 },
          { field: 'deliveryIdCard', title: '收货人', width: 140 },
          { field: 'deliveryPerson', title: '收货电话', width: 140 },
          { field: 'remark', title: '备注', width: 140 }
        ]
      ]
    },
    handleCreate() {
      if (this.form.beforeFlag === enums.WHETHER_STATUS.getFieldByKey('YES')) return this.$message.warning('预付款的付款单不能新增付款明细')
      this.detailsCreate = {
        visible: true,
        params: {
          shippingType: enums.SHIPPING_TYPE.getFieldByKey('TAKE_DELIVERY'),
          warehouseId: this.form.warehouseId
        }
      }
    },
    async handleDetailsCreateSave(data, done) {
      const tableData = this.getDetailsEditTableInstance().getRecords()
      if (!tableData.length) {
        await this.getDetailsEditTableInstance().loadData(data, 'cover')
      } else if (tableData.length > 0) {
        if (data.length > 0) {
          const results = []
          data.forEach(v => {
            const target = tableData.find(x => x.id === v.id)
            target ? results.push(target) : results.push(v)
          })
          this.getDetailsEditTableInstance().loadData(results, 'cover')
        } else {
          this.getDetailsEditTableInstance().loadData([], 'cover')
        }
      }
      done()
      this.detailsCreate.visible = false
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              done()
              return this.$message.error(`出库单: 第${rowIndex}行 ${rule.message}`)
            }
            const shippings = this.getDetailsEditTableInstance().getRecords()
            const formData = Object.assign(
              {
                shippingIdList: shippings.map(v => v.id)
              },
              this.form
            )
            if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
              saveWareDeliveryTake(formData)
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
              updateWareDeliveryTake(formData)
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
    custom-class="common-form-dialog take-no-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="70px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="仓库" prop="warehouseName">
              <business-autocomplete-warehouse
                v-model="form.warehouseName"
                value-key="warehouseName"
                label="仓库"
                placeholder="请输入仓库"
                :auto-assign="{
                  warehouseId: 'id'
                }"
                :form="form"
                @clear="() => (form.warehouseId = 0)"
              ></business-autocomplete-warehouse>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="车牌" prop="plateNo">
              <base-input v-model="form.plateNo" placeholder="请输入车牌" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="司机" prop="person">
              <base-input v-model="form.person" placeholder="请输入司机" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="自提时间" prop="takeDate">
              <base-date-picker
                v-model="form.takeDate"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择自提时间"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="自提人" prop="takePerson">
              <base-input v-model="form.takePerson" placeholder="请输入手机号" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="身份证号" prop="takeIdCard">
              <base-input v-model="form.takeIdCard" placeholder="请输入身份证号" />
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

      <!-- 出库单 -->
      <div class="common-form-block is-special">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          出库单
        </span>
        <base-edit-table ref="detailsEditTableRef" height="300px" :show-added="false" show-footer :name="constant.TABLE_NAME_TAKE_NO_ENTER">
          <template v-slot:buttons="{ selectRecords }">
            <el-button size="mini" type="primary" @click="handleCreate(selectRecords)">生成</el-button>
          </template>
        </base-edit-table>
      </div>
    </base-form>
    <details-create
      v-model="detailsCreate.visible"
      :params="detailsCreate.params"
      :parent-details-table-instance="getDetailsEditTableInstance"
      @save="handleDetailsCreateSave"
    ></details-create>
  </base-dialog>
</template>

<style lang="scss">
.take-no-dialog {
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
