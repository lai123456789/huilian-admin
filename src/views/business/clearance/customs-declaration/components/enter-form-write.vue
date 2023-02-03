<script>
import { clone } from 'xe-utils'

const form = {
  noteS: '',
  markNo: ''
}

export default {
  name: 'EnterFormWrite',
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
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {},
      dicts: {}
    }
  },
  computed: {
    statisticsStyle() {
      return {
        display: 'block',
        marginTop: '4px',
        fontSize: '12px',
        textAlign: 'right'
      }
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form[this.tableRow.field] = this.tableRow.value || ''
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" width="500px" :title="tableRow.title" :show-footer="false">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item :prop="tableRow.field">
            <base-input
              v-model="form[tableRow.field]"
              :autosize="{ minRows: 8 }"
              type="textarea"
              :placeholder="`请输入${tableRow.label}`"
            />
          </base-form-item>
          <span :style="statisticsStyle"
            >(<span>{{ form[tableRow.field] ? form[tableRow.field].length : 0 }}</span
            >字节)
          </span>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
