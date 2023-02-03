<!--  退税申报 -->
<script>
import { getAcctTaxRefundDeclaration, deleteAcctTaxRefundDeclarationById } from '@/api/finance/acct-tax-refund-declaration'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'TaxRefundDeclaration',
  components: { Drawer },
  data() {
    return {
      constant,
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctTaxRefundDeclaration({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'taxRefundNo', title: '退税申报编号', searchProps: true },
        {
          field: 'taxRefundStatus',
          title: '退税状态',
          color: value => {
            return enums.TAX_REFUND_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TAX_REFUND_STATUS)
            }
          }
        },
        {
          field: 'taxRefundMoney',
          title: '退税金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'taxRefundDate', title: '退税到账日期	' },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'orderExportYears', title: '出口年份	' },
        { field: 'billBatch', title: '交单批次' },
        { field: 'billDate', title: '交单时间' },
        { field: 'billPerson', title: '交单人' },
        { field: 'taxAuditDays', title: '审核周期' },
        { field: 'taxAuditDate', title: '审批通过时间' },
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
      show: this.permissions[constant.PERMISSION_TAX_DECLARE],
      mark: constant.PERMISSION_TAX_DECLARE
    }
    this.buttonsConfig = {
      del: {
        visible: this.permissions[constant.PERMISSION_TAX_DECLARE_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctTaxRefundDeclarationById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['taxRefundDeclarationRef'].handleTableClearCheckbox(true)
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
      const { receiptNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: receiptNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['taxRefundDeclarationRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="tax-refund-declaration">
    <!-- 列表页 -->
    <base-page
      ref="taxRefundDeclarationRef"
      :name="constant.TABLE_NAME_TAX_DECLARE"
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
  </div>
</template>
