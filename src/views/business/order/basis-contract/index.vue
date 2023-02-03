<!-- 基差合同 -->
<script>
import { getOrderBasisContract, deleteOrderBasisContractById } from '@/api/order/order-basis-contract'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { jumpCorresOrder } from '@/utils/jump'
import { isFunction } from 'xe-utils'

export default {
  name: 'BasisContractOrder',
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
        const { data } = await getOrderBasisContract({ ...pager, ...transforArrayPayload(params) })
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
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AUDIT_STATUS)
            }
          }
        },
        {
          field: 'orderType',
          title: '订单类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
            }
          }
        },
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: true,
          link: row => jumpCorresOrder(row, this)
        },
        { field: 'contractNo', title: '基差合同编号', searchProps: true },
        { field: 'contractDate', title: '合同日期' },
        {
          field: 'totalMoney',
          title: '成交总金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
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
      show: this.permissions[constant.PERMISSION_BASIS],
      mark: constant.PERMISSION_BASIS
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASIS_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASIS_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASIS_DEL],
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
          deleteOrderBasisContractById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['basisContractOrderRef'].handleTableClearCheckbox(true)
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
      const { contractNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: contractNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['basisContractOrderRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="basis-contract-order">
    <!-- 列表页 -->
    <base-page
      ref="basisContractOrderRef"
      :name="constant.TABLE_NAME_BASIS_ORDER"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
