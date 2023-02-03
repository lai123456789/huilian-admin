<script>
import { updateElementTheme } from '@/utils/update-element-theme'

export default {
  name: 'ThemePicker',
  data() {
    return {
      theme: ''
    }
  },
  computed: {
    defaultTheme() {
      return this.$store.state.settings.themeColor
    }
  },
  watch: {
    defaultTheme: {
      handler(val) {
        this.theme = val
      },
      immediate: true
    }
  },
  methods: {
    handleChange(value) {
       updateElementTheme({ primaryColor: value }).then(() => {
         this.$store.dispatch('settings/setThemeColor', value)
       })
    }
  }
}
</script>

<template>
  <el-color-picker
    v-model="theme"
    :predefine="['#409EFF', '#1890ff', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
    @change="handleChange"
  />
</template>

