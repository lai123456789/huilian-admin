<!-- 进项票 -->
<script>
import { getAcctReceiveInvoice, deleteAcctReceiveInvoiceById } from '@/api/finance/acct-receive-invoice'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import EnterFormCorresp from './components/enter-form-corresp'
import EnterFormTaxDeclare from './components/enter-form-tax-declare'
import EnterFormImportButton from './components/enter-form-import-button'
import { isFunction } from 'xe-utils'

export default {
  name: 'ReceiveInvoice',
  // eslint-disable-next-line vue/no-unused-components
  components: { Drawer, EnterForm, EnterFormCorresp, EnterFormTaxDeclare, EnterFormImportButton },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        rows: [],
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      },
      details: {
        visible: false,
        title: ''
      },
      corresp: {
        visible: false,
        row: {}
      },
      taxDeclare: {
        visible: false,
        row: {}
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctReceiveInvoice({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'auditStatus',
          title: '审核状态',
          color: value => {
            return enums.AUDIT_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select',
            attrs: {
              multiple: true
            }
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AUDIT_STATUS)
            }
          }
        },
        { field: 'taxInvoiceNo', title: '进项票编号', searchProps: true },
        {
          field: 'serviceTaxFlag',
          title: '发票类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SERVICE_TAX_FLAG)
            }
          }
        },
        { field: 'taxDate', title: '税票日期' },
        { field: 'taxNo', title: '发票号码' },
        { field: 'taxCode', title: '发票代码' },
        { field: 'supplierName', title: '开票供应商', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        {
          field: 'totalMoney',
          title: '开票总金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'taxRate',
          title: '税率',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TAX_RATE)
            }
          }
        },
        {
          field: 'cargoMoney',
          title: '货款',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'taxMoney',
          title: '税额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'remark', title: '开票备注' },
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
      show: this.permissions[constant.PERMISSION_INPUT_TICKET],
      mark: constant.PERMISSION_INPUT_TICKET
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_INPUT_TICKET_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '生成退税申报',
          multiple: true,
          visible: this.permissions[constant.PERMISSION_INPUT_TICKET_TAX_DECLARE],
          handler: this.handleAddTaxDeclare
        },
        {
          label: '函调状态变更',
          multiple: true,
          visible: this.permissions[constant.PERMISSION_INPUT_TICKET_CORRESP],
          handler: this.handleCorresp
        },
        {
          label: '导入',
          visible: false,
          render: () => {
            return (
              <business-import-button
                scopedSlots={{
                  'dialog-content': ({ upload }) => {
                    return <enter-form-import-button onSuccess={upload.onSuccess} onError={upload.onError} />
                  }
                }}
              ></business-import-button>
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
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctReceiveInvoiceById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['receiveInvoiceRef'].handleTableClearCheckbox(true)
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
      const { taxInvoiceNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: taxInvoiceNo
      }
    },
    handleAddTaxDeclare(rows) {
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) return this.$message.error('请选择已审核的单据')
      this.taxDeclare = {
        visible: true,
        row: {
          taxInvoiceId: rows.map(v => v.id)
        }
      }
    },
    handleCorresp(rows) {
      this.corresp = {
        visible: true,
        row: {
          ids: rows.map(v => v.id).join(',')
        }
      }
    },
    reLoad(isClearSelect) {
      this.$refs['receiveInvoiceRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receive-invoice">
    <!-- 列表页 -->
    <base-page
      ref="receiveInvoiceRef"
      :name="constant.TABLE_NAME_INPUT_TICKET"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <enter-form-corresp v-model="corresp.visible" :table-row="corresp.row" :re-load="reLoad"></enter-form-corresp>
    <enter-form-tax-declare v-model="taxDeclare.visible" :table-row="taxDeclare.row" :re-load="reLoad"></enter-form-tax-declare>
  </div>
</template>
