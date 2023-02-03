<!-- 出库默认配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT'),
  configByOrderTypes: []
}

export default {
  name: 'ShippingDefault',
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
    const { DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS } = constant
    Promise.all([getDataDictionary([DICTS_ORDER_TYPE, DICTS_WHETHER_STATUS]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(
      ([dicts, info]) => {
        this.dicts = dicts
        const configByOrderTypes = this.dicts[DICTS_ORDER_TYPE].map(v => ({
          orderTypeKey: v.value,
          orderTypeLabel: v.label,
          form: {
            isBuyEx: enums.WHETHER_STATUS.getFieldByKey('NO')
          }
        }))
        Object.assign(this.form, { configByOrderTypes }, info.data)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="订单类型" prop="orderType">
            <base-select v-model="form.orderType" placeholder="请选择订单类型" :options="dicts[constant.DICTS_ORDER_TYPE]" />
          </base-form-item>
        </base-col>

        <div v-for="item in form.configByOrderTypes" :key="item.orderTypeKey">
          <el-divider>{{ item.orderTypeLabel }}</el-divider>
          <base-row>
            <base-col :span="12">
              <base-form-item label="是否多单出库">
                <base-select
                  v-model="item.form.isBuyEx"
                  placeholder="请选择是否多单出库"
                  :clearable="false"
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                />
              </base-form-item>
            </base-col>
          </base-row>
        </div>
      </base-row>
    </base-form>
  </base-dialog>
</template>
