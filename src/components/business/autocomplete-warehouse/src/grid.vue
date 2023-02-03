<script>
import { getBaseWareHouse } from '@/api/base/base-ware-house'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from '@/views/admin/warehouse/components/enter-form'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'

export default {
  name: 'Grid',
  components: { EnterForm },
  props: {
    moduleName: String,
    params: Object
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
            getBaseWareHouse({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'warehouseName', title: '仓库名称' },
          { field: 'warehouseAddress', title: '仓库地址' },
          {
            field: 'companyRegion',
            title: '所属区域',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
              }
            }
          },
          { field: 'person', title: '管理人' }
        ],
        buttonsConfig: {
          add: {
            visible: this.permissions[constant.PERMISSION_BASE_WM_ADD],
            handler: this.handleAdded
          }
        }
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad() {
      this.$refs['autocompleteWarehouseGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-warehouse-grid">
    <base-page
      ref="autocompleteWarehouseGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_WAREHOUSE"
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
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :re-load="reLoad"></enter-form>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-warehouse-grid {
  height: 70vh;
}
</style>
