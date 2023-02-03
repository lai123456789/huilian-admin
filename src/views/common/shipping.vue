<!-- 出库记录 -->
<script>
import { getWareShippingDetail } from '@/api/warehouse/ware-shipping-detail'
import { transforArrayPayload, getOrderByIdAndType } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import jump from '@/utils/jump'

export default {
  name: 'Shipping',
  components: {},
  props: {
    tableRow: Object,
    permissionsShipping: Object
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
        const { data } = await getWareShippingDetail({
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
        { field: 'warehouseName', title: '仓库名称', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: true } },
        { field: 'shippingNo', title: '出库单号', searchProps: true, link: { name: constant.ROUTE_SHIPPING, toField: true } },
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
        { field: 'productNo', title: '商品编号', searchProps: true },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量' },
        { field: 'partNo', title: '料号' },
        { field: 'lotNo', title: '批号' },
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
      const { auditStatus, shippingStatus } = res.data
      this.buttonsConfig = {
        add: {
          // 已审核且出库状态除了已出库
          visible:
            this.permissions[this.permissionsShipping.add] &&
            auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS') &&
            shippingStatus !== enums.WARE_SHIPPING_STATUS.getFieldByKey('SUCCESS'),
          handler: this.jumpAdded
        }
      }
    })
  },
  methods: {
    jumpAdded() {
      jump(this, constant.ROUTE_SHIPPING, { openWareShippingAdded: { parentRow: this.tableRow, orderType: this.tableRow.orderType } })
    },
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
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
      :name="constant.TABLE_NAME_COMMON_SHIPPING"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />
  </div>
</template>
