<script>
import { getCompanyTranDriver } from '@/api/company/company-tran-driver'
// import EnterForm from '@/views/admin/settlement-formula/components/enter-form'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'

export default {
  name: 'Grid',
  // components: { EnterForm },
  props: {
    moduleName: String,
    params: Object,
    addBeforeClick: Function
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    config() {
      return {
        request: ({ pager, params, extraParams }) => {
          return new Promise(resolve => {
            getCompanyTranDriver({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'person', title: '司机', searchProps: true },
          { field: 'mobile', title: '手机号' },
          { field: 'idCard', title: '身份证号' },
          { field: 'remark', title: '备注' }
        ],
        buttonsConfig: {
          // add: {
          //   visible: this.permissions[constant.PERMISSION_DRIVER_ADD],
          //   handler: this.handleAdded
          // }
        }
      }
    }
  },

  methods: {
    async handleAdded() {
      if (this.addBeforeClick && (await this.addBeforeClick())) {
        this.enterForm = {
          visible: true,
          type: enums.FORM_TYPE.getFieldByKey('ADDED')
        }
      }
    },
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad() {
      this.$refs['autocompleteDriverGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-driver-grid">
    <base-page
      ref="autocompleteDriverGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_DRIVER"
      :extra-params="params"
      v-bind="config"
      :show-checkbox="false"
      :tools-config="{
        setting: {
          visible: false
        },
        download: {
          visible: false
        }
      }"
      @cell-dblclick="handleCellDblclick"
    >
    </base-page>
    <!-- <enter-form v-model="enterForm.visible" :table-row="params" :type="enterForm.type" :re-load="reLoad"></enter-form> -->
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-driver-grid {
  height: 70vh;
}
</style>
