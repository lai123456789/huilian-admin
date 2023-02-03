<script>
import { getCompanyTranVehicle } from '@/api/company/company-tran-vehicle'
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
            getCompanyTranVehicle({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'plateNo', title: '大陆车牌', searchProps: true },
          { field: 'plateNoHk', title: '香港车牌', searchProps: true },
          { field: 'tonnage', title: '吨位' },
          { field: 'maxPayload', title: '最大载重' },
          { field: 'recordNo', title: '备案号' },
          { field: 'person', title: '司机', searchProps: true },
          { field: 'mobile', title: '手机号' },
          { field: 'idCard', title: '身份证号' }
        ],
        buttonsConfig: {
          // add: {
          //   visible: this.permissions[constant.PERMISSION_VEHICLE_ADD],
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
      this.$refs['autocompleteVehicleGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-vehicle-grid">
    <base-page
      ref="autocompleteVehicleGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_VEHICLE"
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
.business-autocomplete-vehicle-grid {
  height: 70vh;
}
</style>
