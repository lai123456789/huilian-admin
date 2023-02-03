<!-- 入库单 -->
<script>
import { getWareReceiving, deleteWareReceivingById } from '@/api/warehouse/ware-receiving'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'WareReceiving',
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
        const { data } = await getWareReceiving({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'warehouseName', title: '仓库名称', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: true } },
        { field: 'receivingNo', title: '入库编号', searchProps: true },
        {
          field: 'receivingType',
          title: '入库方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVE_TYPE)
            }
          }
        },
        { field: 'receivingDate', title: '入库日期', searchProps: { type: 'date', sort: 1 } },
        {
          field: 'orderType',
          title: '订单类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVE_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this) },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'expressName', title: '快递服务商' },
        { field: 'expressNo', title: '快递单号' },
        {
          field: 'totalQty',
          title: '总数量',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'totalPackages',
          title: '总件数',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'totalGrossWeight',
          title: '总毛重',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'totalNetWeight',
          title: '总净重',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        { field: 'transportNo', title: '报关运输单号' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      nearlyMonths: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      jumpAddedObj: null
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  async created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_WARE_RECEIVE],
      mark: constant.PERMISSION_WARE_RECEIVE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_WARE_RECEIVE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_WARE_RECEIVE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_WARE_RECEIVE_DEL],
        handler: this.handleDel
      }
    }

    const { openWareReceiveAdded } = this.$route.params

    if (openWareReceiveAdded) {
      // 完全跳转完毕之后，再打开新增弹窗
      this.$nextTick(() => {
        const { parentRow, orderType: orderType } = openWareReceiveAdded
        const { id: orderId, orderNo, tradeMode } = parentRow
        this.jumpAddedObj = { orderId, orderNo, orderType, tradeMode }
        this.enterForm = {
          visible: true,
          type: enums.FORM_TYPE.getFieldByKey('ADDED')
        }
      })
    }
  },
  methods: {
    handleAdded() {
      this.jumpAddedObj = null
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
          deleteWareReceivingById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['receivingRef'].handleTableClearCheckbox(true)
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
    reLoad(isClearSelect) {
      this.$refs['receivingRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receiving">
    <!-- 列表页 -->
    <base-page
      ref="receivingRef"
      :name="constant.TABLE_NAME_WARE_RECEIVING"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '85px',
        form: {
          receivingDate: nearlyMonths
        }
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :jump-added-obj="jumpAddedObj"
      :type="enterForm.type"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
