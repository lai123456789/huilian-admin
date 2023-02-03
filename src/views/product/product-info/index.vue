<!-- 商品信息 -->
<script>
import { getProductInfo, deleteProductInfoById, productInfoImportUrl, productInfoExportUrl } from '@/api/product/product-info'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'ProductInfo',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      downloadConfig: {
        url: productInfoExportUrl,
        params: {},
        fileName: '商品信息模板'
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getProductInfo({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'productName', title: '品名', searchProps: true },
        { field: 'productNo', title: '商品编号' },
        { field: 'productBrand', title: '品牌', searchProps: true },
        { field: 'productModel', title: '型号', searchProps: true },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'productTypeName', title: '商品类别', searchProps: true },
        { field: 'productDesc', title: '描述' },
        { field: 'remark', title: '备注' },
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
      show: this.permissions[constant.PERMISSION_PRODUCT_INFO],
      mark: constant.PERMISSION_PRODUCT_INFO
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_INFO_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_INFO_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_INFO_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '导入',
          visible: this.permissions[constant.PERMISSION_PRODUCT_INFO_IMPORT],
          render: () => {
            return (
              <business-import-button
                action={productInfoImportUrl}
                download-config={this.downloadConfig}
                onResult={this.handleImportResult}
              />
            )
          }
        }
      ]
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
          deleteProductInfoById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['productInfoRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleImportResult(res, status, done) {
      if (status === 'success') {
        if (res.code === enums.BUSINESS_CODE.getFieldByKey('SUCCESS')) {
          this.$nextTick(() => {
            this.reLoad(false)
            this.$message.success('导入成功')
            done()
          })
        } else {
          if (res.data && res.data.length) {
            let msg = ''
            res.data.forEach(v => {
              msg += `第${v.lineNum}行, ${v.errors}; </br>`
            })
            this.$message.error({
              dangerouslyUseHTMLString: true,
              message: msg
            })
          } else {
            this.$message.error(res.msg)
          }
        }
      } else {
        this.$message.error('服务器异常,请联系管理员')
      }
    },
    reLoad(isClearSelect) {
      this.$refs['productInfoRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="product-info">
    <!-- 列表页 -->
    <base-page
      ref="productInfoRef"
      :name="constant.TABLE_NAME_PRODUCT_INFO"
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
