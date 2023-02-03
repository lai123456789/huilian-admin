<!-- 引用报关运输单的enter-form组件 -->
<script>
import enums from '@/enums'
import HgTruckEnterForm from '@/views/business/logistics/hg-truck/components/enter-form'
export default {
  name: 'CreateHgTruck',
  components: { HgTruckEnterForm },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tradingType: String,
    extraPayload: {
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
      visible: this.value
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
  }
}
</script>

<template>
  <hg-truck-enter-form
    v-model="visible"
    :type="enums.FORM_TYPE.getFieldByKey('ADDED')"
    quote-component-type="transportPlan"
    :trading-type="tradingType"
    :extra-payload="extraPayload"
    :re-load="reLoad"
  />
</template>
