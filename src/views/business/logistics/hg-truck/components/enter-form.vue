<!-- ！！！！！！注意: 当前组件有被跨境订车计划的生成报关运输单的功能引用到 -->
<script>
import { getCustomsTransportById, saveCustomsTransport, updateCustomsTransport } from '@/api/customs/customs-transport'
import { generateCustomsImportReserveCar } from '@/api/customs/customs-import-reserve-car'
import { generateCustomsExportReserveCar } from '@/api/customs/customs-export-reserve-car'
import { getCompanyTranVehicle } from '@/api/company/company-tran-vehicle'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import dayjs from '@/utils/day'

const form = {
  tradingType: enums.IEF_LAG.getFieldByKey('IMPORT'),
  trafModeCode: enums.TRANSPORT_MODE.getFieldByKey('LAND'),
  trafModeName: enums.TRANSPORT_MODE.getFieldByKey('LAND', 'label'),
  trafName: '',
  transportDate: dayjs().format('YYYY-MM-DD'),
  carpoolFlag: enums.IS_CAR_POOLING.getFieldByKey('POOLING'),
  carType: '',
  carTrainNo: '',
  cargoListNo: '',
  entyPort: '',
  entyPortCode: void 0,
  startWarehouseId: 0,
  startWarehouseName: '',
  endWarehouseId: 0,
  endWarehouseName: '',
  expressId: 0,
  expressCompanyId: 0,
  expressName: '',
  plateNo: '',
  person: '',
  mobile: '',
  idCard: '',
  shipName: '',
  flightNo: '',
  soNo: '',
  deliveryNo: '',
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
    },
    quoteComponentType: String,
    tradingType: String,
    // 可能被其他组件引用到，传递额外的参数，比如被跨境订车计划引用，额外传递多一个订单id
    extraPayload: {
      type: Object,
      default: () => ({})
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
        transportDate: [{ required: true, message: '运输日期必填' }],
        trafModeName: [{ required: true, message: '运输方式必填' }],
        carType: [{ required: true, message: '订车类型必填' }]
      },
      dicts: {}
    }
  },
  computed: {
    isTransportPlan() {
      // 当前是否被跨境订车计划引用
      return this.quoteComponentType === 'transportPlan'
    },
    entyPortFieldName() {
      return this.isTransportPlan
        ? this.form.tradingType === enums.IEF_LAG.getFieldByKey('IMPORT')
          ? '入境口岸'
          : '离境口岸'
        : '出入境口岸'
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        const { DICTS_IEF_LAG, DICTS_WHETHER_STATUS, DICTS_HIRING_TAXIE_TYPE, DICTS_TRAIN_TYPE, DICTS_TRAF_STATUS } = constant
        Promise.all([
          getDataDictionary([DICTS_IEF_LAG, DICTS_WHETHER_STATUS, DICTS_HIRING_TAXIE_TYPE, DICTS_TRAIN_TYPE, DICTS_TRAF_STATUS]),
          (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') || (this.isTransportPlan && this.extraPayload.transportId)) &&
            getCustomsTransportById(this.isTransportPlan ? this.extraPayload.transportId : this.tableRow.id)
        ]).then(async ([dicts, info]) => {
          this.dicts = dicts

          // 被跨境订车计划引用
          if (this.isTransportPlan) {
            const { trafModeCode, carType, containerNo } = this.extraPayload
            Object.assign(this.form, this.extraPayload, { tradingType: this.tradingType })
            if (trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') || carType === enums.CAR_TYPE.getFieldByKey('TANK')) {
              this.$nextTick(() => {
                if (this.getDetailsEditTableInstance()) {
                  this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
                  const customsTransportDetails = info.data.customsTransportDetailVOList || []
                  // 如果柜号逗号分割，就把分割数据生成的每一条表格数据
                  const customsTransportDetailList = containerNo
                    ? containerNo.split(',').map((v, index) => ({
                        containerNo: customsTransportDetails[index].containerNo || v,
                        containerType: customsTransportDetails[index].containerType || '',
                        containerTypeCode: customsTransportDetails[index].containerTypeCode || 0,
                        weight: customsTransportDetails[index].weight || void 0,
                        lclFlag: customsTransportDetails[index].lclFlag || ''
                      }))
                    : []
                  this.getDetailsEditTableInstance().loadData(customsTransportDetailList, 'cover')
                }
              })
            }
          }

          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
            this.$nextTick(() => {
              if (this.getDetailsEditTableInstance()) {
                this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
                this.getDetailsEditTableInstance().loadData(this.form.customsTransportDetailVOList || [], 'cover')
              }
            })
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
        { field: 'containerNo', title: '集装箱号', width: 140, type: 'input' },
        {
          field: 'containerType',
          title: '集装箱规格',
          width: 240,
          type: 'custom',
          customRender: (h, { row, column }) => {
            return (
              <business-autocomplete-ccl
                vModel={row[column.field]}
                size="mini"
                module-name={constant.AUTOCOMPLETE_KEY_CCL_CONTAINER_FORMAT}
                label="集装箱规格"
                autoAssign={{
                  containerTypeCode: 'code'
                }}
                form={row}
                onClear={() => (row.containerTypeCode = void 0)}
              />
            )
          }
        },
        {
          field: 'weight',
          title: '自重(kg)',
          width: 140,
          type: 'inputNumber',
          attrs: { precision: 4 },
          formatter: {
            type: 'number',
            config: {
              precision: 4
            }
          }
        },
        {
          field: 'lclFlag',
          title: '拼箱标识',
          type: 'select',
          width: 140,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        }
      ]
    },
    handleTradingTypeChange() {
      Object.assign(this.form, {
        carpoolFlag: enums.IS_CAR_POOLING.getFieldByKey('POOLING'),
        entyPort: '',
        entyPortCode: '',
        plateNo: ''
      })
      this.$nextTick(() => {
        this.getFormInstance().clearValidate()
      })
    },
    handleTrafModeNameSelect(rows) {
      const { code } = rows[0]
      Object.assign(this.form, {
        trafModeCode: code,
        carpoolFlag: enums.IS_CAR_POOLING.getFieldByKey('POOLING'),
        carType: '',
        carTrainNo: '',
        cargoListNo: '',
        expressId: 0,
        expressCompanyId: 0,
        expressName: '',
        plateNo: '',
        person: '',
        mobile: '',
        idCard: '',
        shipName: '',
        flightNo: '',
        soNo: '',
        deliveryNo: ''
      })
      this.getFormInstance().clearValidate()
      if (
        (code === enums.TRANSPORT_MODE.getFieldByKey('LAND') && this.form.carType === enums.CAR_TYPE.getFieldByKey('TANK')) ||
        code === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')
      ) {
        this.$nextTick(() => {
          this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
          this.getDetailsEditTableInstance().loadData([], 'cover')
        })
      }
    },
    handleCarTypeChange(value) {
      if (value === enums.CAR_TYPE.getFieldByKey('TANK')) {
        this.$nextTick(() => {
          this.getDetailsEditTableInstance().loadColumns(this.handleColumns())
          this.getDetailsEditTableInstance().loadData([], 'cover')
        })
      }
    },
    async handleExpressNameSelect(rows) {
      const { id, companyId } = rows[0]
      Object.assign(this.form, {
        expressId: id,
        expressCompanyId: companyId
      })

      if (this.form.trafModeCode !== enums.TRANSPORT_MODE.getFieldByKey('LAND')) return
      const res = await getCompanyTranVehicle({ companyId })
      const obj = {}
      if (res.data.records.length > 0) {
        const { plateNo, person, mobile, idCard } = res.data.records[0]
        Object.assign(obj, { plateNo, person, mobile, idCard })
      }
      Object.assign(this.form, obj)
    },
    handleExpressNameClear() {
      Object.assign(this.form, { expressId: 0, expressCompanyId: 0, plateNo: '', person: '', mobile: '', idCard: '' })
    },
    handlePlateNoAddBeforeClick() {
      if (this.form.plateNo === '') {
        this.$message.warning('请先选择已存在的车牌')
        return false
      }
      return true
    },
    handlePlateNoSelect(rows) {
      const { person, mobile, idCard } = rows[0]
      Object.assign(this.form, { person, mobile, idCard })
    },
    handlePlateNoClear() {
      Object.assign(this.form, { person: '', mobile: '', idCard: '' })
    },
    handlePersonAddBeforeClick() {
      if (this.form.expressId === 0) {
        this.$message.warning('请先选择已存在的承运商')
        return false
      }
      return true
    },
    handleValidateSave(done) {
      this.getFormInstance().validate((valids, invalidFields) => {
        if (!valids) {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
          return
        }

        if (this.getDetailsEditTableInstance()) {
          this.getDetailsEditTableInstance().validate(valids => {
            if (valids) {
              const { rowIndex, rule } = valids
              return this.$message.error(`集装箱列表: 第${rowIndex + 1}行 ${rule.message}`)
            }
            this.handleSave(this.form, done)
          })
        } else {
          this.handleSave(this.form, done)
        }
      })
    },
    async handleSave(form, done) {
      let customsTransportDetailDTOList = []
      if (this.getDetailsEditTableInstance()) {
        customsTransportDetailDTOList = this.getDetailsEditTableInstance().getRecords()
      }
      form.customsTransportDetailDTOList = customsTransportDetailDTOList

      if (this.isTransportPlan) {
        try {
          if (form.tradingType === enums.IEF_LAG.getFieldByKey('IMPORT')) {
            await generateCustomsImportReserveCar(form)
          } else {
            await generateCustomsExportReserveCar(form)
          }
          this.$message.success('操作成功')
          this.visible = false
          done()
          this.reLoad(false)
        } catch (error) {
          done()
        }
      } else {
        if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
          saveCustomsTransport(form)
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
          updateCustomsTransport(form)
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
      }
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
    custom-class="common-form-dialog hg-truck-dialog"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleValidateSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="mini">
      <!-- 基本信息 -->
      <div class="common-form-block">
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          基本信息
        </span>
        <base-row :gutter="10">
          <base-col :span="6">
            <base-form-item label="进出口标志" prop="tradingType">
              <base-select
                v-model="form.tradingType"
                :clearable="false"
                :disabled="isTransportPlan"
                placeholder="请选择进出口标志"
                :options="dicts[constant.DICTS_IEF_LAG]"
                @change="handleTradingTypeChange"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="运输日期" prop="transportDate">
              <base-date-picker v-model="form.transportDate" placeholder="请选择运输日期" />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="运输方式" prop="trafModeName">
              <business-autocomplete-ccl
                v-model="form.trafModeName"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRANSPORT"
                label="运输方式"
                placeholder="请选择运输方式"
                value-key="name"
                @select="handleTrafModeNameSelect"
                @clear="() => (form.trafModeCode = '')"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="运输工具" prop="trafName">
              <base-input v-model="form.trafName" placeholder="请输入运输工具" />
            </base-form-item>
          </base-col>

          <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
            <base-col :span="6">
              <base-form-item label="是否拼车" prop="carpoolFlag">
                <base-select
                  v-model="form.carpoolFlag"
                  placeholder="请选择是否拼车"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="订车类型" prop="carType">
                <base-select
                  v-model="form.carType"
                  placeholder="请选择订车类型"
                  :clearable="false"
                  :options="dicts[constant.DICTS_HIRING_TAXIE_TYPE]"
                  @change="handleCarTypeChange"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="车次类型" prop="carTrainNo">
                <base-select
                  v-model="form.carTrainNo"
                  placeholder="请选择车次类型"
                  :clearable="false"
                  :options="dicts[constant.DICTS_TRAIN_TYPE]"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="载货清单号" prop="cargoListNo">
                <base-input v-model="form.cargoListNo" placeholder="请输入载货清单号" />
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="6">
            <base-form-item
              :label="entyPortFieldName"
              prop="entyPort"
              :rules="[{ required: true, message: `${entyPortFieldName}必填`, trigger: 'blur' }]"
            >
              <business-autocomplete-ccl
                v-model="form.entyPort"
                :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
                :label="entyPortFieldName"
                :placeholder="`请选择${entyPortFieldName}`"
                value-key="name"
                :auto-assign="{
                  entyPortCode: 'code'
                }"
                :form="form"
                @clear="() => (form.entyPortCode = '')"
              ></business-autocomplete-ccl>
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="始发仓" prop="startWarehouseName">
              <business-autocomplete-warehouse
                v-model="form.startWarehouseName"
                label="始发仓"
                value-key="warehouseName"
                placeholder="请选择始发仓"
                :auto-assign="{
                  startWarehouseId: 'id'
                }"
                :form="form"
                @clear="() => (form.startWarehouseId = 0)"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item label="目的仓" prop="endWarehouseName">
              <business-autocomplete-warehouse
                v-model="form.endWarehouseName"
                label="目的仓"
                placeholder="请选择目的仓"
                value-key="warehouseName"
                :auto-assign="{
                  endWarehouseId: 'id'
                }"
                :form="form"
                @clear="() => (form.endWarehouseId = 0)"
              />
            </base-form-item>
          </base-col>

          <base-col :span="6">
            <base-form-item
              label="运输公司"
              prop="expressName"
              :rules="[{ required: form.trafModeCode !== enums.TRANSPORT_MODE.getFieldByKey('MARITIME'), message: '运输公司必填' }]"
            >
              <business-autocomplete-basic
                v-model="form.expressName"
                label="运输公司"
                placeholder="请输入运输公司"
                :module-name="constant.AUTOCOMPLETE_KEY_TRANSPORT"
                @select="handleExpressNameSelect"
                @clear="handleExpressNameClear"
              />
            </base-form-item>
          </base-col>

          <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('LAND')">
            <base-col :span="6">
              <base-form-item label="车牌" prop="plateNo">
                <business-autocomplete-vehicle
                  v-model="form.plateNo"
                  label="车牌号码"
                  placeholder="请输入车牌"
                  value-key="plateNo"
                  :is-exist="false"
                  :params="{
                    companyId: form.expressCompanyId,
                    tradingType: form.tradingType,
                    carType: form.carType
                  }"
                  :add-before-click="handlePlateNoAddBeforeClick"
                  @select="handlePlateNoSelect"
                  @clear="handlePlateNoClear"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="司机" prop="person">
                <business-autocomplete-vehicle
                  v-model="form.person"
                  label="司机"
                  placeholder="请输入司机"
                  value-key="person"
                  :is-exist="false"
                  :params="{
                    companyId: form.expressCompanyId
                  }"
                  :add-before-click="handlePersonAddBeforeClick"
                />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="司机电话" prop="mobile">
                <base-input v-model="form.mobile" placeholder="请输入司机电话" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="身份证号" prop="idCard">
                <base-input v-model="form.idCard" placeholder="请输入身份证号" />
              </base-form-item>
            </base-col>
          </template>

          <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')" :span="6">
            <base-form-item
              label="船名"
              prop="shipName"
              :rules="[{ required: form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME'), message: '船名必填' }]"
            >
              <base-input v-model="form.shipName" placeholder="请输入船名" />
            </base-form-item>
          </base-col>

          <base-col v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')" :span="6">
            <base-form-item label="航班号" prop="flightNo">
              <base-input v-model="form.flightNo" placeholder="请输入航班号" />
            </base-form-item>
          </base-col>

          <base-col
            v-if="
              form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') ||
              form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('AIR')
            "
            :span="6"
          >
            <base-form-item
              label="航次号"
              prop="cargoListNo"
              :rules="[{ required: form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME'), message: '航次号必填' }]"
            >
              <base-input v-model="form.cargoListNo" placeholder="请输入航次号" />
            </base-form-item>
          </base-col>

          <template v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME')">
            <base-col :span="6">
              <base-form-item label="SO号" prop="soNo">
                <base-input v-model="form.soNo" placeholder="请输入SO号" />
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="提单号" prop="deliveryNo">
                <base-input v-model="form.deliveryNo" placeholder="请输入提单号" />
              </base-form-item>
            </base-col>
          </template>

          <base-col :span="12">
            <base-form-item label="备注" prop="remark">
              <base-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </base-form-item>
          </base-col>
        </base-row>
      </div>

      <!-- 集装箱列表 -->
      <div
        v-if="form.trafModeCode === enums.TRANSPORT_MODE.getFieldByKey('MARITIME') || form.carType === enums.CAR_TYPE.getFieldByKey('TANK')"
        class="common-form-block is-special"
      >
        <span class="common-form-block-header">
          <i class="icon el-icon-s-grid"></i>
          集装箱列表
        </span>
        <base-edit-table ref="detailsEditTableRef" height="300px" show-footer :name="constant.TABLE_NAME_HG_TRUCK_ENTER" />
      </div>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.hg-truck-dialog {
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
