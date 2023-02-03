<script>
import { getWareShippingOrder } from '@/api/warehouse/ware-shipping'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'DetailsCreate',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    params: Object,
    parentDetailsTableInstance: Function
  },
  data() {
    return {
      constant,
      visible: this.value,
      tableRow: {},
      request: null,
      showPage: false,
      columns: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.isOnce = true

        this.columns = [
          { field: 'shippingNo', title: '出库编号' },
          {
            field: 'orderType',
            title: '订单类型',
            formatter: {
              type: 'options',
              config: {
                options: () => getDataDictionary(constant.DICTS_SHIPPING_ORDER_TYPE)
              }
            }
          },
          { field: 'orderNo', title: '订单编号' },
          { field: 'customerName', title: '客户名称' },
          { field: 'totalQty', title: '总数量', sum: true, footerConfig: { precision: 6 } },
          { field: 'totalPackages', title: '总件数', sum: true, footerConfig: { precision: 6 } },
          { field: 'totalGrossWeight', title: '总毛重', sum: true, footerConfig: { precision: 6 } },
          { field: 'totalNetWeight', title: '	总净重', sum: true, footerConfig: { precision: 6 } },
          { field: 'deliveryAddress', title: '送货地址' },
          { field: 'deliveryCompany', title: '收货公司' },
          { field: 'deliveryIdCard', title: '收货人' },
          { field: 'deliveryPerson', title: '收货电话' },
          { field: 'remark', title: '备注' }
        ]

        this.request = async ({ pager, params }) => {
          const { data } = await getWareShippingOrder({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params))
          })

          if (this.isOnce) {
            const detailsData = this.parentDetailsTableInstance().getRecords()
            this.$refs.detailsCreateRef?.setTableCheckRowKeys(detailsData.map(v => ({ id: v.id })))
            this.isOnce = false
          }

          return Promise.resolve({
            data: data,
            total: data.length
          })
        }
        this.showPage = true
      } else {
        this.showPage = false
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    reLoad(isClearSelect) {
      this.$refs['detailsCreateRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.detailsCreateRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="details-create-dispatch-no-dialog" :visible.sync="visible" width="80%" title="出库单查询" @save="handleSave">
    <div class="details-create">
      <base-page
        v-if="showPage"
        ref="detailsCreateRef"
        :name="constant.TABLE_NAME_TAKE_NO_CREATE"
        :reserve="true"
        :tools-config="{
          setting: {
            visible: false
          },
          download: {
            visible: false
          }
        }"
        :search-config="{
          labelWidth: '110px'
        }"
        show-footer
        :show-pager="false"
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.details-create-dispatch-no-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .details-create {
    height: 60vh;
  }
}
</style>
