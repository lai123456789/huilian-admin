<!-- 出库单 -->
<script>
import { getWareShipping, deleteWareShippingById } from '@/api/warehouse/ware-shipping'
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
  name: 'WareShipping',
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
        const { data } = await getWareShipping({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'shippingNo', title: '出库编号', searchProps: true },
        { field: 'deliveryNo', title: '物流单编号', searchProps: true },
        { field: 'transportNo', title: '报关运输单号' },
        {
          field: 'shippingType',
          title: '出库方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SHIPPING_TYPE)
            }
          }
        },
        {
          field: 'shippingStatus',
          title: '出库状态',
          color: value => {
            return enums.SHIPPING_FLAG.getFieldByValue(value, 'color')
          },
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_FLAG)
            }
          }
        },
        { field: 'shippingDate', title: '出库日期', searchProps: { type: 'date', sort: 1 } },
        {
          field: 'orderType',
          title: '订单类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ORDER_TYPE)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: true, link: row => jumpCorresOrder(row, this) },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'expressName', title: '快递服务商' },
        { field: 'expressNo', title: '快递单号' },
        { field: 'deliveryCompany', title: '收货公司' },
        { field: 'deliveryAddress', title: '送货地址' },
        { field: 'deliveryPerson', title: '收货联系人' },
        { field: 'deliveryMobile', title: '收货联系电话' },
        { field: 'deliveryIdCard', title: '收货人身份证' },
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
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_WARE_SHIPPING],
      mark: constant.PERMISSION_WARE_SHIPPING
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_WARE_SHIPPING_DEL],
        handler: this.handleDel
      }
    }

    const { openWareShippingAdded } = this.$route.params

    if (openWareShippingAdded) {
      // 完全跳转完毕之后，再打开新增弹窗
      this.$nextTick(() => {
        const { parentRow, orderType: orderType } = openWareShippingAdded
        const { id: orderId, orderNo, tradeMode, customerId } = parentRow
        this.jumpAddedObj = { orderId, orderNo, orderType, tradeMode, customerId }
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
          deleteWareShippingById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['shippingRef'].handleTableClearCheckbox(true)
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
      const { shippingNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: shippingNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['shippingRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="shipping">
    <!-- 列表页 -->
    <base-page
      ref="shippingRef"
      :name="constant.TABLE_NAME_WARE_SHIPPING"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '85px',
        form: {
          shippingDate: nearlyMonths
        }
      }"
      :buttons-config="buttonsConfig"
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
