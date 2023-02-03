<script>
import enums from '@/enums'
import { getBaseCclGoodsAttr } from '@/api/base/base-ccl-goods-attr'

export default {
  name: 'GoodsAttr',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    goodsAttrs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      enums,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      records: [],
      selectRecords: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    async value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.records = []
        this.selectRecords = []
        const res = await getBaseCclGoodsAttr({ size: -1 })
        const records = res.data.records
        this.records = records.map(record => {
          if (this.goodsAttrs.find(goodsAttr => record.code === goodsAttr)) {
            const item = { ...record, active: true }
            this.selectRecords.push(item)
            return item
          }
          return { ...record, active: false }
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleSelect(record) {
      record.active = !record.active
      if (record.active) {
        this.selectRecords.push(record)
      } else {
        this.selectRecords.splice(
          this.selectRecords.findIndex(selectRecord => record.code === selectRecord.code),
          1
        )
      }
    },
    handleSave(done) {
      this.$emit('save', this.selectRecords, done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="goods-attrs-dialog" :visible.sync="visible" width="1000px" title="货物属性" @save="handleSave">
    <base-row>
      <base-col v-for="record in records" :key="record.code" :span="6">
        <div :class="['item', { active: record.active }]" @click="handleSelect(record)">{{ `${record.code}-${record.name}` }}</div>
      </base-col>
    </base-row>
  </base-dialog>
</template>

<style lang="scss">
.goods-attrs-dialog {
  $border: 2px solid #2b98ce;
  .el-row {
    border-top: $border;
    border-left: $border;
  }
  .item {
    padding: 5px;
    font-size: 14px;
    border-right: $border;
    border-bottom: $border;
    white-space: nowrap;
    cursor: pointer;
    &.active {
      color: #ffffff;
      background-color: #2b98ce;
    }
  }
}
</style>
