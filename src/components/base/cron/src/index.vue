<template>
  <div class="kh-cron">
    <el-input v-model="defaultValue" placeholder="请输入内容" clearable>
      <template slot="append">
        <i class="kh-cron-append el-icon-setting" @click="handleOpenConfig"></i>
      </template>
    </el-input>
    <base-dialog :visible.sync="visible" title="配置Cron表达式" width="700px" @save="handleSave">
      <cron ref="cron" v-model="cronExpression" />
    </base-dialog>
  </div>
</template>

<script>
import Cron from './cron.vue'
export default {
  name: 'BaseCron',
  components: { Cron },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultValue: this.value,
      cronExpression: '',
      visible: false
    }
  },
  watch: {
    value(val) {
      this.defaultValue = val
    },
    defaultValue(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    handleOpenConfig() {
      this.cronExpression = this.value
      this.visible = true
    },
    handleSave(done) {
      if (this.$refs.cron) {
        this.cronExpression = this.$refs.cron.value_
        this.$emit('input', this.cronExpression)
        this.visible = false
        done()
      }
    }
  }
}
</script>

<style lang="scss">
.kh-cron {
  & &-append {
    font-size: 12px;
    cursor: pointer;
  }
}
</style>
