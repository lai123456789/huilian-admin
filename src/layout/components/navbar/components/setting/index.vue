<script>
import ThemePicker from './components/theme-picker'

export default {
  name: 'Setting',
  components: { ThemePicker },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    handleClick() {
      this.visible = true
    }
  }
}
</script>

<template>
  <div class="setting">
    <base-svg-icon icon-class="setting" title="设置" @click="handleClick" />
    <base-drawer size="360px" :visible.sync="visible" title="应用配置" modal append-to-body :show-footer="false">
      <div>
        <theme-picker></theme-picker>
      </div>
    </base-drawer>
  </div>
</template>
