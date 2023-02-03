<!-- 异常价格波动比例 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'
import { validatorNumRequired } from '@/utils/validate'

const form = {
  priceRule: '',
  statisticalMonth: '',
  abnormalPriceScale: 0
}

export default {
  name: 'AbnormalPriceScope',
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
      rules: {
        priceRule: [{ required: true, message: '价格取值规则必填' }],
        statisticalMonth: [{ required: true, message: '统计月数必填' }],
        abnormalPriceScale: [{ required: true, message: '价格异常比例必填', validator: validatorNumRequired }]
      },
      dicts: {},
      statisticalMonths: [
        { label: '近1个月', value: 1 },
        { label: '近3个月', value: 3 },
        { label: '近6个月', value: 6 },
        { label: '近12个月', value: 12 }
      ]
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
    const { DICTS_PRICE_REVIEW_RULES } = constant
    Promise.all([getDataDictionary([DICTS_PRICE_REVIEW_RULES]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(
      ([dicts, info]) => {
        this.dicts = dicts
        const { abnormalPriceScale } = info.data
        Object.assign(this.form, info.data, {
          abnormalPriceScale: new BigNumber(abnormalPriceScale).times(100).toNumber()
        })
      }
    )
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const formData = Object.assign(clone(this.form, true), {
            abnormalPriceScale: new BigNumber(this.form.abnormalPriceScale).div(100).toNumber()
          })
          updatePublicValueSysPublicParam({ publicKey: this.templateKey, publicValue: JSON.stringify(formData) })
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
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="价格取值规则" prop="priceRule">
            <base-select
              v-model="form.priceRule"
              clearable
              placeholder="请选择"
              :options="dicts[constant.DICTS_PRICE_REVIEW_RULES]"
            ></base-select>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="统计月数" prop="statisticalMonth">
            <base-select v-model="form.statisticalMonth" clearable placeholder="请选择" :options="statisticalMonths"></base-select>
          </base-form-item>
        </base-col>
        <base-col :span="24">
          <base-form-item label="价格异常比例" prop="abnormalPriceScale">
            <base-input-number v-model="form.abnormalPriceScale" placeholder="价格异常比例">
              <template #append> % </template>
            </base-input-number>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
