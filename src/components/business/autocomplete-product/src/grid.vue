<script>
import { getProductInfo } from '@/api/product/product-info'
import EnterForm from '@/views/product/product-info/components/enter-form'
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
            getProductInfo({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
              const { records, total } = res.data
              resolve({
                data: records || [],
                total
              })
            })
          })
        },
        columns: [
          { field: 'productName', title: '品名', searchProps: true },
          { field: 'productNo', title: '商品编号' },
          { field: 'productBrand', title: '品牌' },
          { field: 'productModel', title: '型号' },
          { field: 'productOrigin', title: '产地' },
          { field: 'productUnit', title: '单位' }
        ],
        buttonsConfig: {
          add: {
            visible: this.permissions[constant.PERMISSION_PRODUCT_INFO_ADD],
            handler: this.handleAdded
          }
        }
      }
    }
  },

  methods: {
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad() {
      this.$refs['autocompleteProductGridRef'].refresh(false)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-product-grid">
    <base-page
      ref="autocompleteProductGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_PRODUCT"
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
.business-autocomplete-product-grid {
  height: 70vh;
}
</style>
