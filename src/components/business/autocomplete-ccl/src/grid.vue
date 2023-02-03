<script>
/* eslint-disable vue/no-side-effects-in-computed-properties */
import constant from '@/constant'
import enums from '@/enums'
import autocompleteConfig from '@/config/autocomplete'
import { transforArrayPayload } from '@/utils'
import { mapGetters } from 'vuex'

// import CclCountryEnterForm from '@/views/admin/cus-country/components/enter-form'

export default {
  name: 'Grid',
  // components: { CclCountryEnterForm },
  props: {
    moduleName: String,
    port: Function,
    params: Object
  },
  data() {
    return {
      enums,
      constant,
      componentName: '',
      buttonsConfig: {},
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    config() {
      const config = autocompleteConfig[this.moduleName]
      const { columns, request, showPager, permissions, componentName, searchConfig } = this.configByModuleName(this.moduleName)
      if (permissions) {
        this.buttonsConfig = {
          add: {
            visible: this.permissions[permissions],
            handler: this.handleAdded
          }
        }
        this.componentName = componentName
      }
      return Object.assign({ columns, request, showPager, searchConfig }, config ? config.tableConfig : {})
    }
  },
  methods: {
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    handleAdded() {
      this.enterForm.visible = true
    },
    reLoad() {
      this.$refs['autocompleteCclGridRef'].refresh(false)
    },
    configByModuleName(moduleName) {
      let showPager = true
      let columns = []
      let permissions = void 0
      // let componentName = ''
      let searchConfig = {}
      let request = ({ pager, params, extraParams }) => {
        return new Promise(resolve => {
          this.port({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
            const { records, total } = res.data
            resolve({
              data: records || [],
              total
            })
          })
        })
      }
      const {
        AUTOCOMPLETE_KEY_CCL_CURRENCY,
        AUTOCOMPLETE_KEY_CCL_TRANSPORT,
        AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE,
        AUTOCOMPLETE_KEY_CCL_WRAP_TYPE,
        AUTOCOMPLETE_KEY_CCL_COUNTRY,
        AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT,
        AUTOCOMPLETE_KEY_CCL_DISTRICT,
        AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE,
        AUTOCOMPLETE_KEY_CCL_CUSTOMS,
        AUTOCOMPLETE_KEY_CCL_CONTAINER_FORMAT,
        AUTOCOMPLETE_KEY_CCL_UNIT,
        AUTOCOMPLETE_KEY_CCL_LEVY_TYPE,
        AUTOCOMPLETE_KEY_CCL_TRADE,
        AUTOCOMPLETE_KEY_CCL_DEST_CODE,
        AUTOCOMPLETE_KEY_CCL_LEVYMODE,
        AUTOCOMPLETE_KEY_CCL_ORG_CODE,
        AUTOCOMPLETE_KEY_CCL_ORIG_PLACE_CODE,
        AUTOCOMPLETE_KEY_CCL_USER_TO,
        AUTOCOMPLETE_KEY_CCL_LICENSE_DOCU,
        AUTOCOMPLETE_KEY_CCL_COP_LIMIT
      } = constant
      switch (moduleName) {
        case AUTOCOMPLETE_KEY_CCL_CURRENCY:
          columns = [
            { field: 'code', title: '币制代码', searchProps: true },
            { field: 'name', title: '币制名称', searchProps: true }
          ]
          break
        case AUTOCOMPLETE_KEY_CCL_TRANSPORT:
          columns = [
            { field: 'code', title: '运输方式代码', searchProps: true },
            { field: 'name', title: '运输方式名称', searchProps: true }
          ]
          showPager = false
          searchConfig = { labelWidth: '115px' }
          request = ({ pager, params, extraParams }) => {
            return new Promise(resolve => {
              this.port({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
                resolve({
                  data: res.data || [],
                  total: res.data.length
                })
              })
            })
          }
          break
        case AUTOCOMPLETE_KEY_CCL_TRANSACTION_MODE:
          columns = [
            { field: 'code', title: '成交方式代码', searchProps: true },
            { field: 'name', title: '成交方式名称', searchProps: true }
          ]
          showPager = false
          searchConfig = { labelWidth: '115px' }
          request = ({ pager, params, extraParams }) => {
            return new Promise(resolve => {
              this.port({ ...pager, ...transforArrayPayload(Object.assign(extraParams, params)) }).then(res => {
                resolve({
                  data: res.data || [],
                  total: res.data.length
                })
              })
            })
          }
          break
        case AUTOCOMPLETE_KEY_CCL_WRAP_TYPE:
          columns = [
            { field: 'code', title: '包装种类代码', searchProps: true },
            { field: 'name', title: '包装种类名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_COUNTRY:
          columns = [
            { field: 'code', title: '国家地区代码', searchProps: true },
            { field: 'name', title: '中文名(简称)', searchProps: true },
            { field: 'nameEn', title: '英文名(简称)', searchProps: true }
          ]
          permissions = constant.PERMISSION_CUS_COUNTRY_ADD
          // componentName = CclCountryEnterForm
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_DISTINATE_PORT:
          columns = [
            { field: 'code', title: '港口代码', searchProps: true },
            { field: 'name', title: '中文名称', searchProps: true },
            { field: 'nameEn', title: '英文名称', searchProps: true }
          ]
          break
        case AUTOCOMPLETE_KEY_CCL_DISTRICT:
          columns = [
            { field: 'code', title: '国内地区代码', searchProps: true },
            { field: 'name', title: '国内地区名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_ENTY_PORT_CODE:
          columns = [
            { field: 'code', title: '口岸代码', searchProps: true },
            { field: 'name', title: '口岸名称', searchProps: true }
          ]
          break
        case AUTOCOMPLETE_KEY_CCL_CUSTOMS:
          columns = [
            { field: 'code', title: '关区代码', searchProps: true },
            { field: 'name', title: '关区名称', searchProps: true }
          ]
          break
        case AUTOCOMPLETE_KEY_CCL_CONTAINER_FORMAT:
          columns = [
            { field: 'code', title: '集装箱规格代码', searchProps: true },
            { field: 'name', title: '集装箱规格名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_UNIT:
          columns = [
            { field: 'code', title: '计量单位代码', searchProps: true },
            { field: 'name', title: '计量单位名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_LEVY_TYPE:
          columns = [
            { field: 'code', title: '征免性质代码', searchProps: true },
            { field: 'name', title: '征免性质简称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_TRADE:
          columns = [
            { field: 'code', title: '贸易方式代码', searchProps: true },
            { field: 'name', title: '贸易方式简称', searchProps: true }
          ]
          searchConfig = { labelWidth: '115px' }
          break
        case AUTOCOMPLETE_KEY_CCL_DEST_CODE:
          columns = [
            { field: 'code', title: '国内行政区划代码', searchProps: { span: 8 } },
            { field: 'name', title: '国内行政区划简称', searchProps: { span: 8 } }
          ]
          searchConfig = { labelWidth: '170px', btnsSpan: 8 }
          break
        case AUTOCOMPLETE_KEY_CCL_LEVYMODE:
          columns = [
            { field: 'code', title: '征减免税方式代码', searchProps: { span: 8 } },
            { field: 'name', title: '征减免税方式名称', searchProps: { span: 8 } }
          ]
          searchConfig = { labelWidth: '170px', btnsSpan: 8 }
          break
        case AUTOCOMPLETE_KEY_CCL_ORG_CODE:
          columns = [
            { field: 'code', title: '检验检疫机关代码', searchProps: { span: 8 } },
            { field: 'name', title: '检验检疫机关名称', searchProps: { span: 8 } }
          ]
          searchConfig = { labelWidth: '170px', btnsSpan: 8 }
          break
        case AUTOCOMPLETE_KEY_CCL_ORIG_PLACE_CODE:
          columns = [
            { field: 'code', title: '原产地区代码', searchProps: true },
            { field: 'name', title: '原产地区名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '105px' }
          break
        case AUTOCOMPLETE_KEY_CCL_USER_TO:
          columns = [
            { field: 'code', title: '用途代码', searchProps: true },
            { field: 'name', title: '用途名称', searchProps: true }
          ]
          break
        case AUTOCOMPLETE_KEY_CCL_LICENSE_DOCU:
          columns = [
            { field: 'code', title: '许可证或批文代码', searchProps: { span: 8 } },
            { field: 'name', title: '许可证或批文名称', searchProps: { span: 8 } }
          ]
          searchConfig = { labelWidth: '170px', btnsSpan: 8 }
          break
        case AUTOCOMPLETE_KEY_CCL_COP_LIMIT:
          columns = [
            { field: 'code', title: '企业资质代码', searchProps: true },
            { field: 'name', title: '企业资质名称', searchProps: true }
          ]
          searchConfig = { labelWidth: '105px' }
          break
      }
      return {
        columns,
        request,
        showPager,
        permissions,
        // componentName,
        searchConfig
      }
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-ccl-grid">
    <base-page
      ref="autocompleteCclGridRef"
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_CCL"
      :extra-params="params"
      :buttons-config="buttonsConfig"
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
    <component :is="componentName" v-model="enterForm.visible" :type="enterForm.type" :re-load="reLoad"></component>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-ccl-grid {
  height: 70vh;
}
</style>
