<script>
import BusinessDetailsDrawer from '@/components/business/details-drawer'
import BusinessDetailsDrawerTabs from '@/components/business/details-drawer-tabs'
import { createTabsOpitonsByMenuId } from '@/utils'
import constant from '@/constant'
import { getOrderPurchaseOperRecord } from '@/api/order/order-purchase-oper-record'
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
    deleteFn: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      show: false,
      tabsActive: '0',
      tabOptions: [],
      loading: false,
      permissionsReceiveRecord: {},
      permissionsReceive: {},
      permissionsReceivingError: {},
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
    this.permissionsReceiveRecord = {
      add: constant.PERMISSION_BUS_PURCHASE_RECEIVING_ADD,
      edit: constant.PERMISSION_BUS_PURCHASE_RECEIVING_EDIT,
      del: constant.PERMISSION_BUS_PURCHASE_RECEIVING_DEL
    }
    this.permissionsReceive = {
      exception: constant.PERMISSION_BUS_PURCHASE_WR_RECEIVE_ADD
    }
    this.permissionsReceivingError = {
      exception: constant.PERMISSION_BUS_PURCHASE_EXCEPTION_DISPOSE
    }
    this.annexConfig = {
      fileTypeName: constant.DICTS_FILE_MODULE,
      permissionsAnnex: {
        add: constant.PERMISSION_BUS_PURCHASE_ANNEX_UPLOAD,
        del: constant.PERMISSION_BUS_PURCHASE_ANNEX_DEL
      },
      fileModule: constant.FILE_MODULE_PURCHASE_ORDER
    }
    this.operRecordConfig = {
      pagePort: getOrderPurchaseOperRecord
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
    <business-details-drawer-tabs
      v-model="tabsActive"
      :options="tabOptions"
      :attrs="{
        tableRow: Object.assign(
          {
            orderType: enums.ORDER_TYPE.getFieldByKey('PURCHASE')
          },
          tableRow
        ),
        deleteFn: handleDel,
        reLoad,
        permissionsReceiveRecord,
        permissionsReceive,
        permissionsReceivingError,
        annexConfig,
        operRecordConfig
      }"
    />
  </business-details-drawer>
</template>
