<!-- 主体公司 -->
<script>
import { getCompanyPrincipal, deleteCompanyPrincipalById } from '@/api/company/company-principal'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import { isFunction } from 'xe-utils'

export default {
  name: 'CompanypPrincipal',
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
        const { data } = await getCompanyPrincipal({ ...pager, ...transforArrayPayload(params) })
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
          field: 'companyRegion',
          title: '所属区域',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_COMPANY_REGION)
            }
          },
          searchProps: { type: 'select' }
        },
        { field: 'legalPerson', title: '法定代表人' },
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
      show: this.permissions[constant.PERMISSION_SUB_COMPANY],
      mark: constant.PERMISSION_SUB_COMPANY
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SUB_COMPANY_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SUB_COMPANY_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SUB_COMPANY_DEL],
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
          deleteCompanyPrincipalById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['companyPrincipalRef'].handleTableClearCheckbox(true)
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
      const { companyNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: companyNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['companyPrincipalRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="company-principal">
    <!-- 列表页 -->
    <base-page
      ref="companyPrincipalRef"
      :name="constant.TABLE_NAME_SUB_COMPANY"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
