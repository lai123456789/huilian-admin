<script>
import BusinessDetailsDrawer from '@/components/business/details-drawer'
import BusinessDetailsDrawerTabs from '@/components/business/details-drawer-tabs'
import { createTabsOpitonsByMenuId } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

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
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    orderType: String
  },
  data() {
    return {
      show: false,
      tabsActive: '0',
      tabOptions: [],
      loading: false,
      annexConfig: {},
      operRecordConfig: {}
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
  created() {
    this.annexConfig = {
      fileTypeName: constant.DICTS_FILE_MODULE,
      permissionsAnnex: {
        add:
          this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
            ? constant.PERMISSION_TRANSPORT_PLAN_IMPORT_ANNEX_UPLOAD
            : constant.PERMISSION_TRANSPORT_PLAN_EXPORT_ANNEX_UPLOAD,
        del:
          this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
            ? constant.PERMISSION_TRANSPORT_PLAN_IMPORT_ANNEX_DEL
            : constant.PERMISSION_TRANSPORT_PLAN_EXPORT_ANNEX_DEL
      },
      recordKey: 'orderId',
      fileModule:
        this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT') ? constant.FILE_MODULE_IMPORT_ORDER : constant.FILE_MODULE_EXPORT_ORDER
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
    <business-details-drawer-tabs v-model="tabsActive" :options="tabOptions" :attrs="{ tableRow, reLoad, annexConfig }" />
  </business-details-drawer>
</template>
