<!-- 委托客户 -->
<script>
import { getCompanyCustomer, deleteCompanyCustomerById } from '@/api/company/company-customer'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import { isFunction } from 'xe-utils'

export default {
  name: 'Customer',
  components: { Drawer, EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyCustomer({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'companyNo', title: '企业编号', searchProps: true },
        { field: 'companyName', title: '企业名称', searchProps: true },
        { field: 'companyShortName', title: '企业简称' },
        { field: 'companyNameEn', title: '企业英文名称' },
        { field: 'companyAddress', title: '企业地址' },
        { field: 'companyAddressEn', title: '企业英文地址' },
        {
          field: 'businessRelation',
          title: '合作关系',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_BUSINESS_RELA)
            }
          }
        },
        {
          field: 'customerLevel',
          title: '客户分类',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_CUSTOMER_LEVEL)
            }
          }
        },
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
        { field: 'legalPerson', title: '法定代表人' },
        { field: 'saleManName', title: '业务名称' },
        { field: 'tradeManName', title: '商务名称' },
        { field: 'mobile', title: '手机号' },
        { field: 'person', title: '联系人' },
        { field: 'phone', title: '座机' },
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
      show: this.permissions[constant.PERMISSION_CUSTOMER],
      mark: constant.PERMISSION_CUSTOMER
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CUSTOMER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUSTOMER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUSTOMER_DEL],
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
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCompanyCustomerById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customerRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
            // 第二个参数可能是在page组件下的buttons组件里面定义的loading状态对象，因此需要判断是否为函数
            if (cb && isFunction(cb)) {
              cb()
            }
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      const { companyName } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: companyName
      }
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
      :name="constant.TABLE_NAME_CUSTOMER"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :help-config="helpConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
