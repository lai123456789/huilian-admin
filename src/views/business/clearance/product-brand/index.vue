<!-- 品牌库 -->
<script>
import { getProductBrand, deleteProductBrandById } from '@/api/product/product-brand'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'ProductBrand',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getProductBrand({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'nameZh', title: '品牌中文名称' },
        { field: 'nameEn', title: '品牌英文名称' },
        { field: 'nameZhEn', title: '品牌中英文名称' },
        {
          field: 'type',
          title: '品牌类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_CUSTOMS_ELEMENT_BRAND_TYPE)
            }
          }
        },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_PRODUCT_BRAND],
      mark: constant.PERMISSION_PRODUCT_BRAND
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_BRAND_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_BRAND_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_BRAND_DEL],
        handler: this.handleDel
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
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteProductBrandById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['productBrandRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['productBrandRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="product-brand">
    <!-- 列表页 -->
    <base-page
      ref="productBrandRef"
      :name="constant.TABLE_NAME_PRODUCT_BRAND"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
