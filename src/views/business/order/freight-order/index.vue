<!-- 货代订单 -->
<script>
import { getOrderAgentFreight, deleteOrderAgentFreightById } from '@/api/order/order-agent-freight'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'AgentFreightOrder',
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
        const { data } = await getOrderAgentFreight({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'orderDate', title: '订单日期', searchProps: { type: 'date', sort: 1 } },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        { field: 'cusOrderNo', title: '客户订单号', searchProps: true },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'currencyName', title: '订单币别' },
        {
          field: 'totalMoney',
          title: '订单总价',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'receivingStatus',
          title: '入库状态',
          color: value => {
            return enums.RECEIVING_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVING_STATUS)
            }
          }
        },
        {
          field: 'shippingStatus',
          title: '出库状态',
          color: value => {
            return enums.WARE_SHIPPING_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_STATUS)
            }
          }
        },
        { field: 'tradeManName', title: '商务名称' },
        { field: 'remark', title: '备注', searchProps: true },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      nearlyMonths: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_BUS_FREIGHT],
      mark: constant.PERMISSION_BUS_FREIGHT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BUS_FREIGHT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BUS_FREIGHT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BUS_FREIGHT_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '复制',
          visible: this.permissions[constant.PERMISSION_BUS_FREIGHT_COPY],
          handler: rows => this.handleCopyOrder(rows)
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
          deleteOrderAgentFreightById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['AgentFreightOrderRef'].handleTableClearCheckbox(true)
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
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    handleCopyOrder(rows) {
      this.$confirm('是否复制订单明细?', '', {
        confirmButtonText: '是',
        cancelButtonText: '否'
      })
        .then(() => {
          this.$refs.enterFormRef.handleCopyOrder(true, rows[0], true)
          this.enterForm = {
            visible: true,
            type: enums.FORM_TYPE.getFieldByKey('ADDED')
          }
        })
        .catch(() => {
          this.$refs.enterFormRef.handleCopyOrder(true, rows[0])
          this.enterForm = {
            visible: true,
            type: enums.FORM_TYPE.getFieldByKey('ADDED')
          }
        })
    },
    reLoad(isClearSelect) {
      this.$refs['AgentFreightOrderRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="agent-freight-order">
    <!-- 列表页 -->
    <base-page
      ref="AgentFreightOrderRef"
      :name="constant.TABLE_NAME_BUS_FREIGHT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '105px',
        form: {
          orderDate: nearlyMonths
        }
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
