<script>
import { clone } from 'xe-utils'

const form = {
  customsTotal: 0,
  gQtys: 0,
  firstQtys: 0,
  secondQtys: 0
}

export default {
  name: 'DetailsTotal',
  data() {
    return {
      form: clone(form, true)
    }
  },
  methods: {
    setData(data) {
      this.form = Object.assign(clone(form, true), data)
    }
  }
}
</script>

<template>
  <div class="details-total">
    <div class="details-total-left">tips:</div>
    <div class="details-total-right">
      <div class="details-total-item">
        <div class="details-total-item-label">总价</div>
        <div class="details-total-item-value">{{ form.customsTotal }}</div>
      </div>

      <div class="details-total-item">
        <div class="details-total-item-label">成交数量合计</div>
        <div class="details-total-item-value">{{ form.gQtys }}</div>
      </div>

      <div class="details-total-item">
        <div class="details-total-item-label">法定第一数量合计</div>
        <div class="details-total-item-value">{{ form.firstQtys }}</div>
      </div>

      <div class="details-total-item">
        <div class="details-total-item-label">法定第二数量合计</div>
        <div class="details-total-item-value">{{ form.secondQtys }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.details-total {
  display: flex;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #b7b7b7;
  &-left {
    padding: 0 10px;
  }
  &-item {
    display: flex;
    margin-bottom: 5px;
    &-label {
      margin-right: 10px;
    }
  }
}
</style>
