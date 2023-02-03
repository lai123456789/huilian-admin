<!-- 税收分类 -->
<script>
import { getBaseTaxCategory, deleteBaseTaxCategoryById } from '@/api/base/base-tax-category'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import BigNumber from '@/utils/big-number'
import { mapGetters } from 'vuex'

export default {
  name: 'TaxCategory',
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
        const { data } = await getBaseTaxCategory({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'codeNum', title: '税收编码' },
        { field: 'serviceAbbName', title: '商品或服务分类简称' },
        { field: 'serviceName', title: '商品或服务名称' },
        {
          field: 'generalTax',
          title: '一般纳税人税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'smallTax',
          title: '小规模纳税人征收率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
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
      show: this.permissions[constant.PERMISSION_BASE_TAX_CATE],
      mark: constant.PERMISSION_BASE_TAX_CATE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_TAX_CATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_TAX_CATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_TAX_CATE_DEL],
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
          deleteBaseTaxCategoryById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['taxCategoryRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['taxCategoryRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="tax-category">
    <!-- 列表页 -->
    <base-page
      ref="taxCategoryRef"
      :name="constant.TABLE_NAME_BASE_TAX_CATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
