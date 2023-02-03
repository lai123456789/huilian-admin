<!-- 验货明细 -->
<script>
import { getWareShippingCheckDetail, sortWareShippingCheckDetail } from '@/api/warehouse/ware-shipping-check-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import CheckDetailsSplit from './components/check-details-split'
import CheckBatchEdit from './components/check-batch-edit'
import { mapGetters } from 'vuex'

export default {
  name: 'WareShipping',
  components: { CheckDetailsSplit, CheckBatchEdit },
  props: {
    tableRow: Object,
    mainRow: Object
  },
  data() {
    return {
      constant,
      split: {
        visible: false,
        row: {}
      },
      batchEdit: {
        visible: false
      },
      request: async ({ pager, params }) => {
        const { data } = await getWareShippingCheckDetail({
          ...pager,
          ...transforArrayPayload(Object.assign({ shippingId: this.tableRow.id, size: -1 }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'partNo', title: '料号' },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        {
          field: 'qty',
          title: '数量',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'packages',
          title: '件数',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'ctnsNo', title: '箱号' },
        { field: 'lotNo', title: '批号' },
        { field: 'dateCode', title: '生产日期' },
        {
          field: 'netWeight',
          title: '净重',
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'grossWeight',
          title: '毛重',
          formatter: {
            type: 'number'
          }
        },
        { field: 'volume', title: '体积' },
        { field: 'remark', title: '备注' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      mores: [
        {
          label: '拆分',
          visible: true,
          handler: this.handleCheckSplit
        },
        {
          label: '批量修改',
          type: 'warning',
          visible: true,
          noNeedRows: true,
          handler: this.handleBatchEdit
        },
        {
          label: '上移',
          visible: true,
          handler: rows => this.handleSort(rows, 'up')
        },
        {
          label: '下移',
          visible: true,
          handler: rows => this.handleSort(rows, 'down')
        },
        {
          label: '保存排序',
          visible: true,
          multiple: true,
          handler: this.handleSortSave
        }
      ]
    }
  },
  methods: {
    handleBatchEdit() {
      this.batchEdit.visible = true
    },
    handleCheckSplit(rows) {
      this.split = {
        visible: true,
        row: rows[0]
      }
    },
    handleSort(rows, order) {
      this.$refs.shippingRef.handleRowsSort(rows[0], order)
    },
    handleSortSave() {
      const wareShippingCheckDetailDTOList = this.$refs.shippingRef.getRecords()
      const formData = {
        shippingId: this.tableRow.id,
        ids: wareShippingCheckDetailDTOList.length > 0 ? wareShippingCheckDetailDTOList.map(v => v.id).join(',') : ''
      }
      sortWareShippingCheckDetail(formData).then(() => {
        this.$message.success('操作成功')
        this.reLoad(false)
      })
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
      :name="constant.TABLE_NAME_WARE_SHIPPING_CHECK"
      :show-pager="false"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />
    <check-details-split v-model="split.visible" :main-row="split.row" :table-row="tableRow" :re-load="reLoad" />
    <check-batch-edit v-model="batchEdit.visible" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
