<!-- 服务协议 -->
<script>
import { getCompanyCusContract, deleteCompanyCusContractById, toVoidCompanyCusContract } from '@/api/company/company-cus-contract'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import jump from '@/utils/jump'
import { isFunction } from 'xe-utils'

export default {
  name: 'CusContract',
  components: { EnterForm, Drawer },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    detailsMark: Boolean
  },
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
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyCusContract({
          ...pager,
          ...transforArrayPayload(Object.assign(this.detailsMark ? { customerId: this.tableRow.id } : {}, params))
        })
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
        { field: 'contractNo', title: '协议编号', link: this.detailsMark ? this.jumpToServiceAgree : null, searchProps: true },
        { field: 'contractName', title: '协议名称', searchProps: true },
        {
          field: 'customerName',
          title: '签约客户名称',
          searchProps: true,
          link: this.detailsMark ? null : { name: 'Customer', toField: 'companyName' }
        },
        { field: 'principalName', title: '签约主体名称' },
        {
          field: 'status',
          title: '生效状态',
          color: value => {
            return enums.AGREE_STATUS.getFieldByValue(value, 'color')
          },
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
        { field: 'signDate', title: '签约日期' },
        { field: 'effectiveDate', title: '生效日期' },
        {
          field: 'expireDate',
          title: '到期日期'
        },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      isCopy: false,
      isJump: false,
      // 额外传入的数据
      extraObj: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    if (!this.detailsMark) {
      this.helpConfig = {
        show: this.permissions[constant.PERMISSION_SERVICE_AGREE],
        mark: constant.PERMISSION_SERVICE_AGREE
      }
      this.buttonsConfig = {
        add: {
          visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_ADD],
          handler: this.handleAdded
        },
        edit: {
          visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_EDIT],
          handler: this.handleEdit
        },
        del: {
          visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_DEL],
          handler: this.handleDel
        },
        mores: [
          {
            label: '复制',
            visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_COPY],
            handler: row => this.handleCopy(row)
          },
          {
            label: '作废',
            type: 'danger',
            visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_TO_VOID],
            handler: row => this.handleToVoid(row)
          }
        ]
      }
    } else {
      this.buttonsConfig = {
        add: {
          visible: this.permissions[constant.PERMISSION_SERVICE_AGREE_ADD],
          handler: this.handleDetailsAdded
        },
        mores: [
          {
            label: '更多操作',
            visible: true,
            handler: row => this.handleMore(row)
          }
        ]
      }
    }

    /* 客户详情中服务协议根据协议号跳转服务协议界面并打开详情页 */
    const { openServiceAgreeDetails, openServiceAgreeAdd } = this.$route.params
    if (openServiceAgreeDetails) {
      const { contractNo } = openServiceAgreeDetails
      getCompanyCusContract({ contractNo }).then(({ data }) => {
        this.openDetails({ row: data.records[0] })
      })
    }

    if (openServiceAgreeAdd) {
      this.$nextTick(() => {
        this.isCopy = false
        this.isJump = true
        this.extraObj = openServiceAgreeAdd.row
        this.enterForm = {
          visible: true,
          type: enums.FORM_TYPE.getFieldByKey('ADDED')
        }
      })
    }
  },
  methods: {
    jumpToServiceAgree(row) {
      jump(this, constant.ROUTE_SERVICE_AGREE, { openServiceAgreeDetails: { contractNo: row.contractNo } })
    },
    handleMore() {
      jump(this, constant.ROUTE_SERVICE_AGREE)
    },
    handleDetailsAdded(row) {
      jump(this, constant.ROUTE_SERVICE_AGREE, { openServiceAgreeAdd: { row } })
    },
    handleAdded() {
      this.isCopy = false
      this.isJump = false
      this.extraObj = {}
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.isCopy = false
      this.isJump = false
      this.extraObj = {}
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCompanyCusContractById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusContractRef'].handleTableClearCheckbox(true)
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
      const { contractNo } = row
      this.mainRow = row
      this.details = {
        visible: true,
        title: contractNo
      }
    },
    handleCopy([{ id }]) {
      this.isCopy = true
      this.isJump = false
      this.extraObj = { id }
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    async handleToVoid(row) {
      const { id, status } = row[0]
      if (status !== enums.AGREE_STATUS.getFieldByKey('SUCCESS')) return this.$message.error('请选择已生效的记录')
      this.$confirm('是否确认作废这 1 条记录?')
        .then(() => {
          toVoidCompanyCusContract({ id }).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusContractRef'].handleTableClearCheckbox(true)
            this.$message.success('操作成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['cusContractRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cus-contract">
    <!-- 列表页 -->
    <base-page
      ref="cusContractRef"
      :name="constant.TABLE_NAME_SERVICE_AGREE"
      :columns="columns"
      :request="request"
      :show-checkbox="!detailsMark"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '105px'
      }"
      @cell-dblclick="openDetails"
    />
    <enter-form
      v-model="enterForm.visible"
      :is-copy="isCopy"
      :is-jump="isJump"
      :extra-obj="extraObj"
      :type="enterForm.type"
      :table-row="mainRow"
      :re-load="reLoad"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="mainRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
  </div>
</template>
