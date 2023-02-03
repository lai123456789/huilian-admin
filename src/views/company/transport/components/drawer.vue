<script>
import BusinessDetailsDrawer from '@/components/business/details-drawer'
import BusinessDetailsDrawerTabs from '@/components/business/details-drawer-tabs'
import { createTabsOpitonsByMenuId } from '@/utils'
import constant from '@/constant'
import { getCompanyTransportOperRecord } from '@/api/company/company-transport-oper-record'

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
      show: false,
      tabsActive: '0',
      tabOptions: [],
      loading: false,
      permissionsBank: {},
      permissionsContact: {},
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
    this.permissionsBank = {
      add: constant.PERMISSION_TRANSPORT_BANK_ADD,
      edit: constant.PERMISSION_TRANSPORT_BANK_EDIT,
      del: constant.PERMISSION_TRANSPORT_BANK_DEL
    }
    this.permissionsContact = {
      add: constant.PERMISSION_TRANSPORT_PERSON_ADD,
      edit: constant.PERMISSION_TRANSPORT_PERSON_EDIT,
      del: constant.PERMISSION_TRANSPORT_PERSON_DEL
    }
    this.annexConfig = {
      fileTypeName: constant.DICTS_FILE_MODULE,
      permissionsAnnex: {
        add: constant.PERMISSION_TRANSPORT_AGREE_ANNEX_UPLOAD,
        del: constant.PERMISSION_TRANSPORT_ANNEX_DEL
      },
      fileModule: constant.FILE_MODULE_TRANSPORT
    }
    this.operRecordConfig = {
      pagePort: getCompanyTransportOperRecord
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
      :attrs="{ tableRow, deleteFn: handleDel, reLoad, permissionsBank, permissionsContact,annexConfig,operRecordConfig }"
    />
  </business-details-drawer>
</template>
