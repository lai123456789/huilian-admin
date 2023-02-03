<script>
import enums from '@/enums'

export default {
  name: 'BusMatter',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      enums,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      checks: [],
      rules: {},
      dicts: {},
      options: [
        { label: '税单无纸化', value: 'typeOne' },
        { label: '自主报税', value: 'typeTwo' },
        { label: '自报自缴', value: 'typeFour' },
        { label: '担保验放', value: 'typeThree' },
        { label: '跨境电商海外仓', value: 'typeSix' },
        { label: '特殊通道', value: 'typeSeven' }
      ]
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.checks = []
        for (const k in this.tableRow) {
          if (this.tableRow[k] === enums.WHETHER_STATUS.getFieldByKey('YES')) {
            this.checks.push(k)
          }
        }
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleSave(done) {
      const form = {
        typeOne: enums.WHETHER_STATUS.getFieldByKey('NO'),
        typeTwo: enums.WHETHER_STATUS.getFieldByKey('NO'),
        typeFour: enums.WHETHER_STATUS.getFieldByKey('NO'),
        typeThree: enums.WHETHER_STATUS.getFieldByKey('NO'),
        typeSix: enums.WHETHER_STATUS.getFieldByKey('NO'),
        typeSeven: enums.WHETHER_STATUS.getFieldByKey('NO')
      }
      this.checks.forEach(check => {
        form[check] = enums.WHETHER_STATUS.getFieldByKey('YES')
      })
      this.$emit('save', form, done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="bus-matter-dialog" :visible.sync="visible" width="500px" title="业务事项" @save="handleSave">
    <base-form ref="formRef" :rules="rules" label-width="100px" size="mini">
      <base-checkbox v-model="checks" is-group :options="options"></base-checkbox>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.bus-matter-dialog {
  .el-checkbox {
    width: 130px;
  }
}
</style>
