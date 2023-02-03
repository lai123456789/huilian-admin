<!-- 额度授信 -->
<script>
import { getRiskCusQuotaRecord, deleteRiskCusQuotaRecordById, toVoidRiskCusQuotaRecord } from '@/api/risk/risk-cus-quota-record'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import { isFunction } from 'xe-utils'

export default {
  name: 'CusQuotaRecord',
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
        const { data } = await getRiskCusQuotaRecord({ ...pager, ...transforArrayPayload(params) })
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
        {
          field: 'quotaType',
          title: '额度类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_QUOTA_TYPE)
            }
          }
        },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        {
          field: 'grantMode',
          title: '授信模式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_GRANT_MODE)
            }
          }
        },
        {
          field: 'status',
          title: '额度状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AGREE_STATUS)
            }
          },
          color: value => {
            return enums.AGREE_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          }
        },
        { field: 'currencyName', title: '额度币别' },
        {
          field: 'grantMoney',
          title: '授信金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'effectiveDate', title: '生效日期' },
        { field: 'expireDate', title: '到期日期' },
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
      show: this.permissions[constant.PERMISSION_QUOTA_RECORD],
      mark: constant.PERMISSION_QUOTA_RECORD
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_QUOTA_RECORD_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_QUOTA_RECORD_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_QUOTA_RECORD_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '作废',
          type: 'danger',
          visible: this.permissions[constant.PERMISSION_QUOTA_RECORD_TO_VOID],
          handler: row => this.handleToVoid(row)
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
          deleteRiskCusQuotaRecordById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusQuotaRecordRef'].handleTableClearCheckbox(true)
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
    async handleToVoid(row) {
      const { id, status } = row[0]
      if (status !== enums.AGREE_STATUS.getFieldByKey('SUCCESS')) return this.$message.error('请选择已生效的记录')
      this.$confirm('是否确认作废这 1 条记录?')
        .then(() => {
          toVoidRiskCusQuotaRecord({ id }).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusQuotaRecordRef'].handleTableClearCheckbox(true)
            this.$message.success('操作成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      this.tableRow = row
      this.details = {
        visible: true,
        title: ''
      }
    },
    reLoad(isClearSelect) {
      this.$refs['cusQuotaRecordRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cus-quota-record">
    <!-- 列表页 -->
    <base-page
      ref="cusQuotaRecordRef"
      :name="constant.TABLE_NAME_QUOTA_RECORD"
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
  </div>
</template>
