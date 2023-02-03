<!-- （进口）报关单配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  overseasConsignorName: '',
  overseasConsignorId: 0,
  agentName: '',
  agentId: 0,
  tradeModeName: '',
  tradeModeCode: void 0,
  cutModeName: '',
  cutModeCode: void 0,
  feeInsurRate: 0,
  feeRate: 0,
  insurRate: 0,
  otherRate: 0,
  tradeCountryName: '',
  tradeCountryCode: void 0,
  tradeAreaName: '',
  tradeAreaCode: void 0,
  entyPortName: '',
  entyPortCode: void 0,
  despPortName: '',
  despPortCode: void 0,
  distinatePortName: '',
  distinatePortCode: void 0,
  entryType: '',
  goodsPlace: '',
  markNo: '',
  destinationCountryName: '',
  destinationCountryCode: void 0,
  districtName: '',
  districtCode: void 0,
  destName: '',
  destCode: void 0,
  dutyModeName: '',
  dutyModeCode: void 0
}

export default {
  name: 'ExportCustomsMaster',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    templateKey: String,
    title: String,
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
      rules: {},
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  mounted() {
    // 点进来立马的触发一下弹窗高度刷新
    this.$refs.dialogRef.handleResize()
    this.form = clone(form, true)
    const { DICTS_ENTER_TYPE } = constant
    Promise.all([getDataDictionary([DICTS_ENTER_TYPE]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(([dicts, info]) => {
      this.dicts = dicts
      Object.assign(this.form, info.data)
    })
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          updatePublicValueSysPublicParam({ publicKey: this.templateKey, publicValue: JSON.stringify(this.form) })
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              // 刷新表格的时候，保存之前选中的数据
              this.reLoad(true)
            })
            .catch(() => {
              done()
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
    }
  }
}
</script>

<template>
  <base-dialog ref="dialogRef" :visible.sync="visible" width="90%" :title="title" @save="handleSave">
    <base-form ref="formRef" class="import-customs-master" :model="form" :rules="rules" label-width="110px" size="mini">
      <base-row>
        <base-col :span="6">
          <base-form-item label="境外发货人" prop="overseasConsignorName">
            <business-autocomplete-basic
              v-model="form.overseasConsignorName"
              label="境外发货人"
              :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL_EN"
              placeholder="请输入境外发货人"
              :auto-assign="{
                overseasConsignorId: 'id'
              }"
              :params="{
                companyRegion: enums.COMPANY_REGION.getFieldByKey('ABROAD')
              }"
              :form="form"
              @clear="() => (form.overseasConsignorId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="申报单位名称" prop="agentName">
            <business-autocomplete-basic
              v-model="form.agentName"
              label="申报单位名称"
              :module-name="constant.AUTOCOMPLETE_KEY_CUSTOMS"
              placeholder="请输入申报单位名称"
              :auto-assign="{
                agentId: 'id'
              }"
              :form="form"
              @clear="() => (form.agentId = 0)"
            ></business-autocomplete-basic>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="监管方式名称" prop="tradeModeName">
            <business-autocomplete-ccl
              v-model="form.tradeModeName"
              label="监管方式名称"
              placeholder="请输入监管方式名称"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_TRADE"
              :auto-assign="{
                tradeModeCode: 'code'
              }"
              :form="form"
              @clear="() => (form.tradeModeCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="征免性质名称" prop="cutModeName">
            <business-autocomplete-ccl
              v-model="form.cutModeName"
              label="征免性质名称"
              placeholder="请输入征免性质名称"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_LEVY_TYPE"
              :auto-assign="{
                cutModeCode: 'code'
              }"
              :form="form"
              @clear="() => (form.cutModeCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="启运国(地区)" prop="tradeCountryName">
            <business-autocomplete-ccl
              v-model="form.tradeCountryName"
              label="启运国(地区)"
              placeholder="请输入启运国(地区)"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
              :auto-assign="{
                tradeCountryCode: 'code'
              }"
              :form="form"
              @clear="() => (form.tradeCountryCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="贸易国别(地区)" prop="tradeAreaName">
            <business-autocomplete-ccl
              v-model="form.tradeAreaName"
              label="贸易国别(地区)"
              placeholder="请输入贸易国别(地区)"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
              :auto-assign="{
                tradeAreaCode: 'code'
              }"
              :form="form"
              @clear="() => (form.tradeAreaCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="CIF运保费比例" prop="feeInsurRate">
            <base-input-number v-model="form.feeInsurRate" :precision="4" placeholder="请输入CIF运保费比例" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="FOB运费比例" prop="feeRate">
            <base-input-number v-model="form.feeRate" :precision="4" placeholder="请输入FOB运费比例" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="FOB保费比例" prop="insurRate">
            <base-input-number v-model="form.insurRate" :precision="4" placeholder="请输入FOB保费比例" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="FOB杂费比例" prop="otherRate">
            <base-input-number v-model="form.otherRate" :precision="4" placeholder="请输入FOB杂费比例" />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="入境口岸" prop="entyPortName">
            <business-autocomplete-ccl
              v-model="form.entyPortName"
              label="入境口岸"
              placeholder="请输入入境口岸"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE"
              :auto-assign="{
                entyPortCode: 'code'
              }"
              :form="form"
              @clear="() => (form.entyPortCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="启运港" prop="despPortName">
            <business-autocomplete-ccl
              v-model="form.despPortName"
              label="启运港"
              placeholder="请输入启运港"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
              :auto-assign="{
                despPortCode: 'code'
              }"
              :form="form"
              @clear="() => (form.despPortCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="经停港" prop="distinatePortName">
            <business-autocomplete-ccl
              v-model="form.distinatePortName"
              label="经停港"
              placeholder="请输入经停港"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT"
              :auto-assign="{
                distinatePortCode: 'code'
              }"
              :form="form"
              @clear="() => (form.distinatePortCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="报关单类型" prop="entryType">
            <base-select v-model="form.entryType" clearable placeholder="请选择" :options="dicts[constant.DICTS_ENTER_TYPE]"></base-select>
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="货物存放地点" prop="goodsPlace">
            <base-input v-model="form.goodsPlace" placeholder="请输入货物存放地点" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="标记唛码" prop="markNo">
            <base-input v-model="form.markNo" type="textarea" placeholder="请输入标记唛码" />
          </base-form-item>
        </base-col>
      </base-row>

      <el-divider>报关明细配置</el-divider>

      <base-row>
        <base-col :span="6">
          <base-form-item label="最终目的国(地区)" prop="destinationCountryName">
            <business-autocomplete-ccl
              v-model="form.destinationCountryName"
              label="最终目的国(地区)"
              placeholder="请输入最终目的国(地区)"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_COUNTRY"
              :auto-assign="{
                destinationCountryCode: 'code'
              }"
              :form="form"
              @clear="() => (form.destinationCountryCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="境内目的地" prop="districtName">
            <business-autocomplete-ccl
              v-model="form.districtName"
              label="境内目的地"
              placeholder="请输入境内目的地"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DISTRICT"
              :auto-assign="{
                districtCode: 'code'
              }"
              :form="form"
              @clear="() => (form.districtCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="目的地" prop="destName">
            <business-autocomplete-ccl
              v-model="form.destName"
              label="目的地"
              placeholder="请输入目的地"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_DEST_CODE"
              :auto-assign="{
                destCode: 'code'
              }"
              :form="form"
              @clear="() => (form.destCode = void 0)"
            />
          </base-form-item>
        </base-col>

        <base-col :span="6">
          <base-form-item label="征免方式" prop="dutyModeName">
            <business-autocomplete-ccl
              v-model="form.dutyModeName"
              label="征免方式"
              placeholder="请输入征免方式"
              :module-name="constant.AUTOCOMPLETE_KEY_CCL_LEVY_TYPE"
              :auto-assign="{
                dutyModeCode: 'code'
              }"
              :form="form"
              @clear="() => (form.dutyModeCode = void 0)"
            />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>

<style lang="scss" scoped>
.import-customs-master {
  ::v-deep .el-divider--horizontal {
    margin: 10px 0 20px;
  }
}
</style>
