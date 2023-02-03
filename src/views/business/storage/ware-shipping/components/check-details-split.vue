<script>
import { getWareShippingCheckDetailById, splitWareShippingCheckDetail } from '@/api/warehouse/ware-shipping-check-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'

export default {
  name: 'CheckDetailsSplit',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    mainRow: Object,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        Promise.all([getDataDictionary([]), getWareShippingCheckDetailById(this.mainRow.id)]).then(([dicts, info]) => {
          this.dicts = dicts
          const validProductModelAndProductName = ({ row }) => {
            if (!row.productName && !row.productModel) {
              return new Error('品名和型号必填其中一个')
            }
          }
          const columns = [
            { field: 'partNo', width: 120, title: '料号', type: 'input' },
            {
              field: 'productName',
              title: '品名',
              width: 120,
              type: 'custom',
              rules: [{ validator: validProductModelAndProductName }],
              customRender: (h, { row, column }) => {
                return (
                  <business-autocomplete-product
                    vModel={row[column.field]}
                    size="mini"
                    value-key="productName"
                    label="品名"
                    placeholder="请输入品名"
                    onSelect={rows => this.handleProductNameSelect(rows, row)}
                  />
                )
              }
            },
            {
              field: 'productModel',
              title: '型号',
              width: 180,
              type: 'custom',
              rules: [{ validator: validProductModelAndProductName }],
              customRender: (h, { row, column }) => {
                return (
                  <business-autocomplete-basic
                    vModel={row[column.field]}
                    size="mini"
                    triggerOnFocus={false}
                    isExist={false}
                    module-name={constant.AUTOCOMPLETE_KEY_PRODUCT_MODEL}
                    label="型号"
                    placeholder="请输入型号"
                    onSelect={rows => this.handleProductModelSelect(rows, row)}
                  />
                )
              }
            },
            { field: 'productBrand', width: 120, title: '品牌', type: 'input' },
            {
              field: 'productOrigin',
              title: '产地',
              width: 180,
              type: 'custom',
              customRender: (h, { row, column }) => {
                return (
                  <business-autocomplete-ccl
                    vModel={row[column.field]}
                    size="mini"
                    module-name={constant.AUTOCOMPLETE_KEY_CCL_COUNTRY}
                    label="产地"
                    placeholder="请输入产地"
                  />
                )
              }
            },
            {
              field: 'productUnit',
              title: '单位',
              width: 150,
              type: 'custom',
              customRender: (h, { row, column }) => {
                return (
                  <business-autocomplete-basic
                    vModel={row[column.field]}
                    size="mini"
                    module-name={constant.AUTOCOMPLETE_KEY_PRODUCT_UNIT}
                    label="单位"
                    placeholder="请输入单位"
                  />
                )
              }
            },
            {
              field: 'qty',
              width: 100,
              title: '数量',
              type: 'inputNumber',
              rules: [{ required: true, message: '数量必填' }],
              sum: true,
              attrs: {
                precision: 6
              }
            },
            {
              field: 'packages',
              width: 100,
              title: '件数',
              type: 'inputNumber',
              sum: true,
              attrs: {
                precision: 2
              }
            },
            { field: 'ctnsNo', width: 100, title: '箱号', type: 'input' },
            { field: 'lotNo', width: 100, title: '批号', type: 'input' },
            { field: 'dateCode', width: 100, title: '生产日期', type: 'input' },
            {
              field: 'netWeight',
              width: 100,
              title: '净重',
              type: 'inputNumber',
              sum: true,
              attrs: {
                precision: 2
              }
            },
            {
              field: 'grossWeight',
              width: 100,
              title: '毛重',
              type: 'inputNumber',
              sum: true,
              attrs: {
                precision: 2
              }
            },
            { field: 'volume', width: 100, title: '体积', type: 'input' },
            { field: 'remark', width: 100, title: '备注', type: 'input' }
          ]
          this.$refs.splitEditTableARef.loadColumns(columns)
          this.$refs.splitEditTableARef.loadData([info.data], 'cover')
          this.$refs.splitEditTableBRef.loadColumns(columns)
        })
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleSplit() {
      const tableDataA = this.$refs.splitEditTableARef.getRecords()
      const tableDataB = this.$refs.splitEditTableBRef.getRecords()
      this.$refs.splitEditTableBRef
        .getVxeGridInstance()
        .createRow({
          ...tableDataA[0],
          id: tableDataB.length
        })
        .then(row => {
          this.$refs.splitEditTableBRef.loadData(row)
        })
    },
    handleProductNameSelect(rows, row) {
      const { id: productId, productName, productModel, productBrand, productOrigin, productUnit } = rows[0]
      Object.assign(row, {
        productId,
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
      })
    },
    handleProductModelSelect(rows, row) {
      const { productName, productModel, productBrand, productOrigin, productUnit } = rows[0]

      Object.assign(row, {
        productName,
        productModel,
        productBrand,
        productOrigin,
        productUnit
      })
    },
    handleSave(done) {
      const wareShippingCheckDetailDTO = this.$refs.splitEditTableARef.getRecords()[0]
      const wareShippingCheckDetailDTOList = this.$refs.splitEditTableBRef.getRecords()
      const formData = {
        shippingId: this.tableRow.id,
        shippingCheckDetailId: this.mainRow.id,
        wareShippingCheckDetailDTO,
        wareShippingCheckDetailDTOList
      }
      splitWareShippingCheckDetail(formData)
        .then(() => {
          this.$message.success('操作成功')
          this.reLoad(false)
          done()
          this.visible = false
        })
        .catch(() => {
          done()
        })
    }
  }
}
</script>

<template>
  <base-dialog custom-class="check-details-split-dialog" :visible.sync="visible" width="99%" title="拆分" @save="handleSave">
    <div class="check-details-split-a">
      <base-edit-table
        ref="splitEditTableARef"
        max-height="200px"
        :show-added="false"
        :show-delete="false"
        :show-checkbox="false"
        :name="constant.TABLE_NAME_WARE_SHIPPING_CHECK_SPLIT_A"
      />
    </div>
    <div class="check-details-split-b">
      <base-edit-table
        ref="splitEditTableBRef"
        key-field="id"
        height="400px"
        :show-added="false"
        :show-delete="false"
        :show-checkbox="false"
        :name="constant.TABLE_NAME_WARE_SHIPPING_CHECK_SPLIT_B"
      >
        <template v-slot:buttons>
          <el-button size="mini" type="primary" @click="handleSplit">拆分</el-button>
        </template>
      </base-edit-table>
    </div>
  </base-dialog>
</template>

<style lang="scss">
.check-details-split-dialog {
  .check-details-split-a {
    padding: 10px 0;
  }
  .check-details-split-b {
    padding: 10px 0;
  }
}
</style>
