<!-- 商品单位 -->
<script>
import { getProductUnit, deleteProductUnitById } from '@/api/product/product-unit'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'ProductUnit',
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
        const { data } = await getProductUnit({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'unitName', title: '单位名称(中)', searchProps: true },
        { field: 'unitNameEn', title: '单位名称(英)' },
        { field: 'sort', title: '排序' },
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
      show: this.permissions[constant.PERMISSION_PRODUCT_UNIT],
      mark: constant.PERMISSION_PRODUCT_UNIT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_UNIT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_UNIT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_UNIT_DEL],
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
          deleteProductUnitById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['productUnitRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['productUnitRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="product-unit">
    <!-- 列表页 -->
    <base-page
      ref="productUnitRef"
      :name="constant.TABLE_NAME_PRODUCT_UNIT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '120px'
      }"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
