<!-- 商品管制情况 -->
<script>
import { getBaseProductControl, deleteBaseProductControlById } from '@/api/base/base-product-control'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'ProductControl',
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
        const { data } = await getBaseProductControl({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'productName', title: '品名', searchProps: true },
        { field: 'productModel', title: '型号', searchProps: true },
        { field: 'productDesc', title: '商品说明', textMaxColumnWidth: 200 },
        { field: 'controlType', title: '管制类别' },
        {
          field: 'controlFlag',
          title: '是否管制品',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
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
      show: this.permissions[constant.PERMISSION_PRODUCT_CONTROL],
      mark: constant.PERMISSION_PRODUCT_CONTROL
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_CONTROL_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_CONTROL_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_PRODUCT_CONTROL_DEL],
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
          deleteBaseProductControlById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['productControlRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['productControlRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="product-control">
    <!-- 列表页 -->
    <base-page
      ref="productControlRef"
      :name="constant.TABLE_NAME_PRODUCT_CONTROL"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :search-config="{
        labelWidth: '90px'
      }"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
