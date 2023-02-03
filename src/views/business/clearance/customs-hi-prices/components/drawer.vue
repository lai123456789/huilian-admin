<script>
import BusinessDetailsDrawer from '@/components/business/details-drawer'
import BusinessDetailsDrawerTabs from '@/components/business/details-drawer-tabs'
import { createTabsOpitonsByMenuId } from '@/utils'

export default {
  name: 'Drawer',
  components: { BusinessDetailsDrawer, BusinessDetailsDrawerTabs },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: String,
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      show: false,
      tabsActive: '0',
      tabOptions: [],
      loading: false
    }
  },
  watch: {
    visible(newValue) {
      this.show = newValue
      if (!newValue) {
        this.tabOptions = []
      }
    },
    show(newValue) {
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    createPage() {
      this.loading = true
      this.tabOptions = []
      this.tabsActive = '0'
      return new Promise((resolve, reject) => {
        const { meta } = this.$route
        createTabsOpitonsByMenuId(meta.id)
          .then(options => {
            this.tabOptions = options
            this.loading = false
            resolve()
          })
          .catch(() => {
            this.loading = false
            reject()
          })
      })
    },
    handleDel() {
      this.deleteFn(
        {
          id: this.tableRow.id
        },
        () => {
          this.handleCloseDrawer()
        }
      )
    },
    handleOpened() {
      this.createPage()
    },
    handleRefresh() {
      this.createPage()
    },
    handleCloseDrawer() {
      this.show = false
    }
  }
}
</script>

<template>
  <business-details-drawer
    ref="detailsDrawerRef"
    :loading="loading"
    :title="title"
    :visible.sync="show"
    @opened="handleOpened"
    @refresh="handleRefresh"
  >
    <business-details-drawer-tabs v-model="tabsActive" :options="tabOptions" :attrs="{ tableRow }" />
  </business-details-drawer>
</template>
