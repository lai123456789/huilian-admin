<!-- 服务协议模板 -->
<script>
import { getCompanyCusContractTemplate, deleteCompanyCusContractTemplateById } from '@/api/company/company-cus-contract-template'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'CusContractTemplate',
  components: { EnterForm, Drawer },
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
        const { data } = await getCompanyCusContractTemplate({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'templateNo', title: '模板编号', searchProps: true },
        { field: 'templateName', title: '模板名称', searchProps: true },
        { field: 'principalName', title: '签约主体名称' },
        {
          field: 'status',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AGREE_STATUS)
            }
          },
          searchProps: { type: 'select' }
        },
        {
          field: 'tradeMode',
          title: '贸易模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          },
          searchProps: { type: 'select' }
        },
        { field: 'remark', title: '备注' },
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
      show: this.permissions[constant.PERMISSION_ACCT_PAYMENT_VERIFY],
      mark: constant.PERMISSION_ACCT_PAYMENT_VERIFY
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_TEMPLATE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_TEMPLATE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_TEMPLATE_DEL],
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
          deleteCompanyCusContractTemplateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusContractTemplateRef'].handleTableClearCheckbox(true)
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
      if (this.detailsMark) return
      const { templateNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: templateNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['cusContractTemplateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cus-contract-template">
    <!-- 列表页 -->
    <base-page
      ref="cusContractTemplateRef"
      :name="constant.TABLE_NAME_SERVICE_AGREE_TEMPLATE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
  </div>
</template>
