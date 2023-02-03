<!-- 委托客戶->销售客户 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormCusCustomer from './components/enter-form-cus-customer'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { deleteCompanyCusCustomerById, getCompanyCusCustomer } from '@/api/company/company-cus-customer'

export default {
  name: 'Customer',
  components: { EnterFormCusCustomer },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyCusCustomer({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customerId: this.tableRow.id,
                companyId: this.tableRow.companyId
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'companyName', title: '企业名称', searchProps: true },
        { field: 'companyNameEn', title: '企业英文名称' },
        { field: 'companyAddress', title: '企业地址' },
        { field: 'companyAddressEn', title: '企业英文地址' },
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
        { field: 'mobile', title: '手机号' },
        { field: 'person', title: '联系人' },
        { field: 'phone', title: '座机' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_CUSTOMER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_CUSTOMER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_CUSTOMER_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCompanyCusCustomerById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customerRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['customerRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customer">
    <!-- 列表页 -->
    <base-page
      ref="customerRef"
      :name="constant.TABLE_NAME_CUSTOMER_CUS_CUSTOMER"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-cus-customer
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
