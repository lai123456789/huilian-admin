<!-- 结/付汇参数配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  paymentRateDate: '09:30:00',
  paymentRateType: enums.FOREIGN_PRICE_TYPE.getFieldByKey('PER'),
  settlementRateDate: '09:30:00',
  settlementRateType: enums.FOREIGN_PRICE_TYPE.getFieldByKey('PER')
}

export default {
  name: 'FinanceSettlementConfig',
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
    const { DICTS_FOREIGN_PRICE_TYPE } = constant
    Promise.all([getDataDictionary([DICTS_FOREIGN_PRICE_TYPE]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(
      ([dicts, info]) => {
        this.dicts = dicts
        Object.assign(this.form, info.data)
      }
    )
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
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" class="import-customs-master" :model="form" :rules="rules" label-width="90px" size="mini">
      <el-divider>付汇配置</el-divider>
      <base-row>
        <base-col :span="24">
          <base-form-item label="外汇牌价类型" prop="paymentRateType">
            <base-select
              v-model="form.paymentRateType"
              :clearable="false"
              placeholder="请选择外汇牌价类型"
              :options="dicts[constant.DICTS_FOREIGN_PRICE_TYPE]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="外汇牌价时间" prop="paymentRateDate">
            <base-time-picker
              v-model="form.paymentRateDate"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择外汇牌价时间"
            ></base-time-picker>
          </base-form-item>
        </base-col>
      </base-row>

      <el-divider>结汇配置</el-divider>
      <base-row>
        <base-col :span="24">
          <base-form-item label="外汇牌价类型" prop="settlementRateType">
            <base-select
              v-model="form.settlementRateType"
              :clearable="false"
              placeholder="请选择外汇牌价类型"
              :options="dicts[constant.DICTS_FOREIGN_PRICE_TYPE]"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="外汇牌价时间" prop="settlementRateDate">
            <base-time-picker
              v-model="form.settlementRateDate"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择外汇牌价时间"
            ></base-time-picker>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
