<script>
export default {
  name: 'ReceiptContentViewr',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    receiptContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false
    }
  },
  watch: {
    async visible(val) {
      this.show = val
    },
    show(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="show" title="查看回执内容" width="800px" :show-save="false">
    <base-input v-model="receiptContent" readonly type="textarea" :rows="20" />
  </base-dialog>
</template>
