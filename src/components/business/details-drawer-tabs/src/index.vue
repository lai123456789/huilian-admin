<script>
import { mapGetters } from 'vuex'

export default {
  name: 'BusinessDetailsDrawerTabs',
  props: {
    value: String,
    options: {
      type: Array,
      default: () => []
    },
    attrs: {
      type: Object,
      default: () => ({})
    },
    on: {
      type: Object,
      default: () => ({})
    },
    isRefreshComponent: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      modelValue: '0',
      tabs: this.options,
      component: ''
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  watch: {
    value: {
      handler(newValue) {
        this.modelValue = newValue
        if (this.tabs.length) {
          process.env.NODE_ENV === 'development' &&
            console.log(
              `🧭(关联数据-${this.tabs[Number(newValue)].label})本地文件路径: %c${this.tabs[Number(newValue)].path}`,
              'color: #82d6d5'
            )
          this.createPages(this.tabs, newValue).then(({ componentName }) => {
            this.component = componentName
          })
        }
      },
      immediate: true
    },
    modelValue(newValue) {
      this.$emit('input', newValue)
    },
    options(newValue) {
      this.tabs = newValue
      if (newValue.length) {
        this.createPages(newValue, this.modelValue).then(({ componentName }) => {
          this.component = componentName
        })
      }
    }
  },
  methods: {
    handleTabsClick(opt) {
      this.$emit('tabs-click', opt)
    },
    async createPages(tabs, index = '0') {
      const getComponents = path => {
        return new Promise((reslove, reject) => {
          const url = path.replace('\\', '/')
          require([`@/views${url}`], function (res) {
            reslove(res)
          }).catch(() => {
            reject(new Error('无法找到组件, 查看文件地址是否正确'))
          })
        })
      }
      const tab = tabs.filter(v => this.permissions[v.permission])[Number(index)]
      const { default: componentName } = await getComponents(tab.path)
      return {
        componentName
      }
    }
  }
}
</script>

<template>
  <div class="business-details-drawer-tabs">
    <el-tabs v-model="modelValue" @tab-click="handleTabsClick">
      <el-tab-pane v-for="(option, index) in tabs" :key="`tabs_pane_${index}`" :name="`${index}`">
        <template #label>
          <span class="business-details-drawer-tabs-label">{{ option.label }}</span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <div class="business-details-drawer-tabs-content">
      <component
        :is="component"
        v-if="isRefreshComponent"
        ref="componentRef"
        v-bind="Object.assign({ detailsMark: true }, attrs)"
        v-on="on"
      />
    </div>
  </div>
</template>

<style lang="scss">
.business-details-drawer-tabs {
  display: flex;
  overflow: hidden;
  height: 100%;
  flex-direction: column;
  .el-tabs {
    padding: 0 10px;
  }
  .el-tabs__header {
    margin-bottom: 0;
    .el-tabs__item {
      padding: 0 5px;
    }
  }
  &-label {
    padding: 11px 10px;
  }
  &-content {
    height: 0;
    flex: 1;
    > div {
      height: 100%;
    }
  }
}
</style>
