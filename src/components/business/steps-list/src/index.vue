<script>
export default {
  name: 'BusinessStepsList',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    active: {
      type: Number,
      default: 0
    }
  },
  methods: {
    handleCommand(item) {
      item.handler && item.handler(item)
    }
  }
}
</script>

<template>
  <div>
    <el-steps :direction="direction" :active="active" class="business-steps" process-status="success" finish-status="success">
      <el-step
        v-for="(item, index) in options"
        :key="index"
        :status="item.processStatus"
        :title="item.title"
        :description="item.description"
      ></el-step>
    </el-steps>
  </div>
</template>

<style lang="scss">
.business-steps {
  .el-step {
    .el-step__icon {
      top: -4px;
      margin-left: 2px;
      width: 20px;
      height: 20px;
      font-size: 13px;
    }
    .el-step__main {
      margin-top: -2px;
      .el-step__title {
        font-size: 13px;
      }
    }
  }
  .el-step.is-vertical:not(:last-child) .el-step__main .el-step__description {
    margin-top: -7px;
    margin-bottom: 10px;
  }
}
</style>
