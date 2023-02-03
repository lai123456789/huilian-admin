<script>
import { getBaseCclGoodsAttr } from '@/api/base/base-ccl-goods-attr'
import { clone } from 'xe-utils'
import BigNumber from '@/utils/big-number'
import enums from '@/enums'
import constant from '@/constant'
import GoodsSpecs from './goods-specs'
import GoodsAttr from './goods-attr'

const form = {
  itemNo: 0,
  contrItem: '',
  codeTS: '',
  hsCode: '',
  hsName: '',
  gName: '',
  gModel: '',
  gQty: 0,
  gUnit: '',
  gUnitCode: void 0,
  declPrice: 0,
  declTotal: 0,
  tradeCurr: '',
  tradeCurrCode: void 0,
  firstQty: void 0,
  firstUnit: '',
  secondUnit: '',
  exgVersion: '',
  exgNo: '',
  destinationCountry: '',
  destinationCountryCode: void 0,
  secondQty: void 0,
  origPlace: '',
  origPlaceCode: void 0,
  originCountry: '',
  originCountryCode: void 0,
  district: '',
  districtCode: void 0,
  dest: '',
  destCode: void 0,
  dutyMode: '',
  dutyModeCode: void 0,
  purpose: '',
  purposeCode: void 0,
  goodsAttr: '',
  goodsAttrName: '',
  // 检验检疫货物规格相关字段
  goodsSpecGather: '',
  stuff: '',
  prodValidDt: '',
  prodQgp: 0,
  engManEntCnm: '',
  goodsSpec: '',
  goodsBrand: '',
  produceDate: '',
  prodBatchNo: '',
  mnufctrRegNo: '',
  productBrand: '',
  productModel: ''
}

export default {
  name: 'ParticularsForm',
  components: { GoodsSpecs, GoodsAttr },
  props: {
    orderType: {
      type: String,
      default: enums.IEF_LAG.getFieldByKey('IMPORT')
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      enums,
      constant,
      goodsSpecs: {
        visible: false,
        form: {}
      },
      goodsAttr: {
        visible: false,
        arr: []
      },
      isExpand: false,
      form: clone(form, true),
      rules: {}
    }
  },
  computed: {
    firstQty: {
      get() {
        return this.form.firstQty === null ? void 0 : this.form.firstQty
      },
      set(value) {
        this.form.firstQty = value === void 0 ? null : value
      }
    },
    secondQty: {
      get() {
        return this.form.secondQty === null ? void 0 : this.form.secondQty
      },
      set(value) {
        this.form.secondQty = value === void 0 ? null : value
      }
    }
  },
  methods: {
    parentAssignForm(record) {
      this.resetFieldForm()
      const { stuff, prodValidDt, prodQgp, engManEntCnm, goodsSpec, goodsBrand, produceDate, prodBatchNo, mnufctrRegNo } = record
      Object.assign(this.form, record, {
        goodsSpecGather: this.splitGoodsSpecForm({
          stuff,
          prodValidDt,
          prodQgp,
          engManEntCnm,
          goodsSpec,
          goodsBrand,
          produceDate,
          prodBatchNo,
          mnufctrRegNo
        })
      })
      this.getCusGoodsAttrs(record.goodsAttr.split(',')).then(result => {
        this.form.goodsAttrName = result
      })
    },
    parentClearForm(record = {}) {
      this.resetFieldForm()
      this.form = Object.assign(clone(form, true), record)
    },
    formValidate(callback) {
      this.$refs['form'].validate((valid, errMsgs) => {
        if (valid) {
          callback()
        } else {
          const errMsg = Object.values(errMsgs)[0][0]
          this.$message.error(errMsg.message)
        }
      })
    },
    resetFieldForm() {
      this.$refs.formRef.resetFields()
    },
    handleExpand(isExpand) {
      this.isExpand = isExpand
    },
    handleGoodsSpecGather() {
      if (this.disabled) return
      const { stuff, prodValidDt, prodQgp, engManEntCnm, goodsSpec, goodsBrand, produceDate, prodBatchNo, mnufctrRegNo } = this.form
      this.goodsSpecs = {
        visible: true,
        form: {
          stuff,
          prodValidDt,
          prodQgp,
          engManEntCnm,
          goodsSpec,
          goodsBrand,
          produceDate,
          prodBatchNo,
          mnufctrRegNo
        }
      }
    },
    handleGoodsSpecsSave(form, done) {
      Object.assign(
        this.form,
        {
          goodsSpecGather: this.splitGoodsSpecForm(form)
        },
        form
      )
      done()
      this.goodsSpecs.visible = false
    },
    splitGoodsSpecForm(form) {
      const arr = []
      for (const key in form) {
        if (Object.hasOwnProperty.call(form, key)) {
          const item = form[key]
          if (item || (item === '0' && key !== 'prodQgp')) {
            arr.push(item)
          }
        }
      }
      return arr.join(',')
    },
    async getCusGoodsAttrs(goodsAttrs = []) {
      const res = await getBaseCclGoodsAttr({ size: -1 })
      const records = res.data.records
      const result = []
      records.forEach(record => {
        if (goodsAttrs.find(goodsAttr => record.code === goodsAttr)) {
          result.push(record.name)
        }
      })
      return result.join(',')
    },
    handleGoodsAttr() {
      if (this.disabled) return
      this.goodsAttr = {
        visible: true,
        arr: this.form.goodsAttr.split(',')
      }
    },
    handleGoodsAttrsSave(records, done) {
      this.form.goodsAttr = records.map(record => record.code).join(',')
      this.form.goodsAttrName = records.map(record => record.name).join(',')
      done()
      this.goodsAttr.visible = false
    },
    calcPrice(type) {
      const { gQty, declPrice, declTotal } = this.form
      if (type === 'declTotal') {
        if (gQty) {
          this.form.declPrice = new BigNumber(declTotal).div(gQty).dp(6).toNumber()
        }
      } else {
        this.form.declTotal = new BigNumber(gQty).times(declPrice).dp(6).toNumber()
      }
    }
  }
}
</script>

<template>
  <div class="details-form relative">
    <base-form ref="formRef" :show-message="false" :disabled="disabled" :model="form" :rules="rules" size="mini">
      <table class="percent-100">
        <tbody>
          <tr>
            <td class="td-scale-07 text-align-right">项号</td>
            <td>
              <base-form-item prop="itemNo">
                <base-input v-model="form.itemNo" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="td-scale-08 text-align-right">备案序号</td>
            <td>
              <base-form-item prop="contrItem">
                <base-input v-model="form.contrItem" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="td-scale-10 text-align-right">商品编号</td>
            <td>
              <base-form-item class="non-empty" prop="codeTS">
                <base-input v-model="form.codeTS" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right td-scale-17">检验检疫名称</td>
            <td colspan="3" class="ciq-code-name">
              <div class="flex">
                <base-form-item prop="hsName" class="flex-1">
                  <base-input v-model="form.hsName" disabled :clearable="false" />
                </base-form-item>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">报关名称</td>
            <td colspan="3">
              <base-form-item class="non-empty" prop="gName">
                <base-input v-model="form.gName" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">规格型号</td>
            <td colspan="5">
              <base-form-item prop="gModel">
                <base-input v-model="form.gModel" disabled :clearable="false" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">成交数量</td>
            <td>
              <base-form-item prop="gQty">
                <base-input-number v-model="form.gQty" disabled :clearable="false" @blur="calcPrice('gQty')" />
              </base-form-item>
            </td>
            <td class="text-align-right">成交计量单位</td>
            <td>
              <base-form-item prop="gUnit">
                <base-input v-model="form.gUnit" disabled />
              </base-form-item>
            </td>
            <td class="text-align-right">申报单价</td>
            <td>
              <base-form-item prop="declPrice">
                <base-input-number v-model="form.declPrice" :precision="2" disabled :clearable="false" @blur="calcPrice('declPrice')" />
              </base-form-item>
            </td>
            <td class="text-align-right percent-4">申报总价</td>
            <td>
              <base-form-item prop="declTotal">
                <base-input-number v-model="form.declTotal" :precision="2" disabled :clearable="false" @blur="calcPrice('declTotal')" />
              </base-form-item>
            </td>
            <td class="text-align-right td-scale-20">币制</td>
            <td>
              <base-form-item prop="tradeCurr">
                <base-input v-model="form.tradeCurr" :clearable="false" disabled />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">法定第一数量</td>
            <td>
              <base-form-item prop="firstQty">
                <base-input-number v-model="firstQty" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">法定第一计量单位</td>
            <td>
              <base-form-item prop="firstUnit">
                <base-input v-model="form.firstUnit" disabled />
              </base-form-item>
            </td>
            <td class="text-align-right">加工成品单耗版本号</td>
            <td>
              <base-form-item prop="exgVersion">
                <base-input v-model="form.exgVersion" :disabled="disabled" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">货号</td>
            <td>
              <base-form-item prop="exgNo">
                <base-input v-model="form.exgNo" :disabled="disabled" :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">最终目的国(地区)</td>
            <td>
              <base-form-item prop="destinationCountry">
                <business-autocomplete-ccl
                  v-model="form.destinationCountry"
                  :disabled="disabled"
                  :clearable="false"
                  label="最终目的国(地区)"
                  placeholder="请输入最终目的国(地区)"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                  :auto-assign="{
                    destinationCountryCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.destinationCountryCode = void 0)"
                >
                  >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="text-align-right">法定第二数量</td>
            <td>
              <base-form-item prop="secondQty">
                <base-input-number v-model="secondQty" disabled :clearable="false" />
              </base-form-item>
            </td>
            <td class="text-align-right">法定第二计量单位</td>
            <td>
              <base-form-item prop="secondUnit">
                <base-input v-model="form.secondUnit" disabled />
              </base-form-item>
            </td>
            <td class="text-align-right">原产国(地区)</td>
            <td :colspan="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '2' : '4'">
              <base-form-item prop="originCountry">
                <business-autocomplete-ccl
                  v-model="form.originCountry"
                  :disabled="disabled"
                  :clearable="false"
                  label="原产国(地区)"
                  placeholder="请输入原产国(地区)"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
                  :auto-assign="{
                    originCountryCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.originCountryCode = void 0)"
                >
                  >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <!-- 优惠贸易协定项下原产地 -->
            <td>
              <div class="flex">
                <button type="button" :disabled="disabled" class="btn flex-1">协定享惠</button>
              </div>
            </td>
            <template v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')">
              <td class="text-align-right">原产地区</td>
              <td>
                <base-form-item prop="origPlace">
                  <business-autocomplete-ccl
                    v-model="form.origPlace"
                    :disabled="disabled"
                    :clearable="false"
                    label="原产地区"
                    placeholder="请输入原产地区"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_ORIG_PLACE_CODE"
                    :auto-assign="{
                      origPlaceCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.origPlaceCode = void 0)"
                  >
                    >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
            </template>
          </tr>
          <tr>
            <td colspan="2">
              <div v-if="!isExpand" class="expand el-icon-arrow-right" @click="handleExpand(true)"></div>
              <div v-else class="expand el-icon-arrow-down" @click="handleExpand(false)"></div>
            </td>
            <td v-if="orderType === enums.IEF_LAG.getFieldByKey('IMPORT')" class="text-align-right">境内目的地</td>
            <td v-else class="text-align-right">境内货源地</td>
            <td colspan="2">
              <base-form-item prop="district">
                <business-autocomplete-ccl
                  v-model="form.district"
                  :disabled="disabled"
                  :clearable="false"
                  :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '境内目的地代码' : '境内货源地'"
                  :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '境内目的地代码' : '境内货源地'}`"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTRICT"
                  :auto-assign="{
                    districtCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.districtCode = void 0)"
                >
                  >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td colspan="3">
              <base-form-item prop="dest">
                <business-autocomplete-ccl
                  v-model="form.dest"
                  :disabled="disabled"
                  :clearable="false"
                  :label="orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '目的地代码' : '产地代码'"
                  :placeholder="`请输入${orderType === enums.IEF_LAG.getFieldByKey('IMPORT') ? '目的地代码' : '产地代码'}`"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_DEST_CODE"
                  :auto-assign="{
                    destCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.destCode = void 0)"
                >
                  >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="text-align-right">征免方式</td>
            <td>
              <base-form-item prop="dutyMode">
                <business-autocomplete-ccl
                  v-model="form.dutyMode"
                  :disabled="disabled"
                  :clearable="false"
                  label="征免方式"
                  placeholder="请输入征免方式"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_LEVYMODE"
                  :auto-assign="{
                    dutyModeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.dutyModeCode = void 0)"
                >
                  >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
          </tr>

          <template v-if="isExpand">
            <tr>
              <td class="text-align-right">检验检疫货物规格</td>
              <td colspan="7">
                <div class="flex">
                  <base-form-item prop="goodsSpecGather" class="flex-1">
                    <base-input v-model="form.goodsSpecGather" disabled :clearable="false" />
                  </base-form-item>
                  <div class="textarea">
                    <i class="icon el-icon-more" @click="handleGoodsSpecGather"></i>
                  </div>
                </div>
              </td>
              <td rowspan="2" colspan="2" class="text-align-center">
                <div class="flex flex-col">
                  <button class="btn m-b-2" :disabled="disabled" type="button">产品资质</button>
                  <button class="btn" :disabled="disabled" type="button">危险货物信息</button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="text-align-right">货物属性</td>
              <td colspan="3">
                <div class="flex">
                  <base-form-item prop="goodsAttrName" class="flex-1">
                    <base-input v-model="form.goodsAttrName" disabled :clearable="false" />
                  </base-form-item>
                  <div class="textarea">
                    <i class="icon el-icon-more" @click="handleGoodsAttr"></i>
                  </div>
                </div>
              </td>
              <td class="text-align-right">用途</td>
              <td colspan="3">
                <base-form-item prop="purpose">
                  <business-autocomplete-ccl
                    v-model="form.purpose"
                    :disabled="disabled"
                    :clearable="false"
                    label="用途"
                    placeholder="请输入用途"
                    :module-name="constant.AUTOCOMPLETE_KEY_CCL_USER_TO"
                    :auto-assign="{
                      purposeCode: 'code'
                    }"
                    :form="form"
                    @clear="() => (form.purposeCode = void 0)"
                  >
                    >
                    <template v-slot="{ option }">
                      <span>{{ `${option.code} ${option.name}` }}</span>
                    </template>
                  </business-autocomplete-ccl>
                </base-form-item>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </base-form>
    <goods-specs v-model="goodsSpecs.visible" :table-row="goodsSpecs.form" @save="handleGoodsSpecsSave" />
    <goods-attr v-model="goodsAttr.visible" :goods-attrs="goodsAttr.arr" @save="handleGoodsAttrsSave" />
  </div>
</template>

<style lang="scss" scoped>
.details-form {
  table {
    table-layout: fixed;
  }
  table,
  tr,
  td {
    border: 1px solid #b7b7b7;
  }
  tr > td {
    font-size: 12px;
  }
  .border-l {
    border-left: 1px solid #b7b7b7;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-1 {
    flex: 1 1 0%;
  }
  .relative {
    position: relative;
  }
  .border-collapse {
    border-collapse: collapse;
  }
  .percent-100 {
    width: 100%;
  }
  .percent-4 {
    width: 40%;
  }
  .ciq-code-name {
    width: 32.5%;
  }
  .text-align-right {
    padding-right: 2px;
    text-align: right;
  }
  .m-b-2 {
    margin-bottom: 2px;
  }
  .checkbox-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
  }
  .btn {
    padding: 0 2px;
    height: 24px;
    font-size: 12px;
    border: 0;
    border-radius: 4px;
    color: #ffffff;
    background-color: #096ac6;
    line-height: normal;
    cursor: pointer;
  }
  .textarea {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
    .icon {
      margin-left: 4px;
      width: 16px;
      height: 16px;
      font-size: 12px;
      border-radius: 50%;
      text-align: center;
      color: #ffffff;
      background-color: #096ac6;
      line-height: 16px;
      cursor: pointer;
    }
  }
  .expand {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1px 1px 1px 5px;
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 8px;
    color: #ffffff;
    background-color: #096ac6;
    line-height: normal;
    cursor: pointer;
  }
  ::v-deep .el-form-item {
    margin-bottom: 0;
    .el-input__inner {
      padding-right: 4px !important;
      padding-left: 4px;
      border: none;
    }
    &.is-error {
      border: 1px solid $--color-danger;
      box-sizing: border-box;
    }
    &.non-empty {
      .drop-pop-input-inner {
        background-color: #faffbd;
      }
      .el-input__inner {
        background-color: #faffbd;
      }
      .is-disabled {
        .drop-pop-input-inner {
          background-color: #f5f7fa;
        }
        .el-input__inner {
          background-color: #f5f7fa;
        }
      }
    }
  }
}

@media screen and (min-width: 1600px) {
  .td-scale-07 {
    width: 11%;
  }
  .td-scale-08 {
    width: 10%;
  }
  .td-scale-10 {
    width: 12%;
  }
  .td-scale-11 {
    width: 85% !important;
  }
  .td-scale-17 {
    width: 8% !important;
  }
  .td-scale-19 {
    width: 93% !important;
  }
  .td-scale-20 {
    width: 8% !important;
  }
}

@media screen and (min-width: 1366px) and (max-width: 1599px) {
  .td-scale-07 {
    width: 12%;
  }
  .td-scale-08 {
    width: 12%;
  }
  .td-scale-10 {
    width: 13%;
  }
  .td-scale-11 {
    width: 82% !important;
  }
  .td-scale-17 {
    width: 9% !important;
  }
  .td-scale-19 {
    width: 92% !important;
  }
  .td-scale-20 {
    width: 11% !important;
  }
}

@media screen and (min-width: 1100px) and (max-width: 1365px) {
  .td-scale-07 {
    width: 13%;
  }
  .td-scale-08 {
    width: 12%;
  }
  .td-scale-10 {
    width: 13%;
  }
  .td-scale-11 {
    width: 82% !important;
  }
  .td-scale-17 {
    width: 9% !important;
  }
  .td-scale-19 {
    width: 90% !important;
  }
  .td-scale-20 {
    width: 11% !important;
  }
}

@media screen and (min-width: 750px) and (max-width: 1099px) {
  .td-scale-07 {
    width: 13%;
  }
  .td-scale-08 {
    width: 12%;
  }
  .td-scale-10 {
    width: 13%;
  }
  .td-scale-11 {
    width: 77% !important;
  }
  .td-scale-17 {
    width: 9% !important;
  }
  .td-scale-19 {
    width: 87% !important;
  }
  .td-scale-20 {
    width: 14% !important;
  }
}
</style>
