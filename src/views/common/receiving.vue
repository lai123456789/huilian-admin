<!-- 收货记录 -->
<script>
import { getWareReceiptRecord, getWareReceiptRecordById } from '@/api/warehouse/ware-receipt-record'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'

export default {
  name: 'ReceiptRecord',
  components: {},
  props: {
    tableRow: Object,
    permissionsReceiveRecord: Object
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
        const { data } = await getWareReceiptRecord({
          ...pager,
          ...transforArrayPayload(params),
          orderId: this.tableRow.id,
          orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT')
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
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
        { field: 'orderNo', title: '订单编号', link: row => jumpCorresOrder(row, this) },
        {
          field: 'claimStatus',
          title: '认领状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          },
          searchProps: { type: 'select' }
        },
        {
          field: 'receivingStatus',
          title: '入库状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVING_STATUS)
            }
          },
          searchProps: { type: 'select' }
        },
        { field: 'receiptDate', title: '收货时间' },
        { field: 'companyName', title: '送货商' },
        { field: 'warehouseName', title: '收货仓库' },
        { field: 'location', title: '收货库位' },
        {
          field: 'deliveryType',
          title: '收货方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVE_TYPE)
            }
          }
        },
        { field: 'expressName', title: '快递服务商' },
        { field: 'expressNo', title: '快递单号' },
        { field: 'remark', title: '备注' },
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
    this.buttonsConfig = {
      add: {
        visible: this.permissions[this.permissionsReceiveRecord.add],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[this.permissionsReceiveRecord.edit],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[this.permissionsReceiveRecord.del],
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
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          getWareReceiptRecordById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['receiptRecordRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['receiptRecordRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receipt-record">
    <!-- 列表页 -->
    <base-page
      ref="receiptRecordRef"
      :name="constant.TABLE_NAME_BUS_IMPORT_RECEIVING"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />
  </div>
</template>
