<!-- 入库记录 -->
<script>
import { getWareReceivingDetail } from '@/api/warehouse/ware-receiving-detail'
import { transforArrayPayload, getOrderByIdAndType } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import jump from '@/utils/jump'

export default {
  name: 'Receive',
  components: {},
  props: {
    tableRow: Object,
    permissionsReceive: Object
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareReceivingDetail({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                orderId: this.tableRow.id,
                orderType: this.tableRow.orderType
              },
              params
            )
          )
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
        { field: 'warehouseName', title: '仓库名称', searchProps: true },
        { field: 'receivingNo', title: '入库单号', searchProps: true, link: { name: constant.ROUTE_RECEIVING, toField: 'receivingNo' } },
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
        { field: 'receivingDate', title: '入库日期' },
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
        { field: 'productNo', title: '商品编号', searchProps: true },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量', sum: true },
        {
          field: 'price',
          title: '单价',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 },
          align: 'right'
        },
        { field: 'totalMoney', title: '总价', sum: true, align: 'right' },
        { field: 'packages', title: '件数', sum: true },
        { field: 'location', title: '库位' },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'partNo', title: '料号' },
        { field: 'lotNo', title: '批号' },
        { field: 'netWeight', title: '净重', sum: true },
        {
          field: 'grossWeight',
          title: '毛重',
          sum: true,
          attrs: {
            precision: 2
          }
        },
        { field: 'dateCode', title: '生产日期' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    getOrderByIdAndType(this.tableRow.orderType)(this.tableRow.id).then(res => {
      const { auditStatus, receivingStatus } = res.data
      this.buttonsConfig = {
        add: {
          // 已审核且入库状态除了已入库
          visible:
            this.permissions[this.permissionsReceive.add] &&
            auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS') &&
            receivingStatus !== enums.RECEIVING_STATUS.getFieldByKey('SUCCESS'),
          handler: this.jumpAdded
        }
      }
    })
  },
  methods: {
    jumpAdded() {
      jump(this, constant.ROUTE_RECEIVING, { openWareReceiveAdded: { parentRow: this.tableRow, orderType: this.tableRow.orderType } })
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
      :name="constant.TABLE_NAME_COMMON_RECEIVE"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />
  </div>
</template>
