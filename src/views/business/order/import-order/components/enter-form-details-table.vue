<script>
import constant from '@/constant'
import { updateOrderImportDetail } from '@/api/order/order-import-detail'

export default {
  name: 'EnterFormDetailsTable',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderId: [Number, String]
  },
  data() {
    return {
      constant,
      visible: this.value,
      loading: false,
      isLoadData: false,
      isLoadColumns: false
    }
  },
  watch: {
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.loading = true
      } else {
        this.loading = false
        this.isLoadData = false
        this.isLoadColumns = false
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    loadData(data) {
      this.$nextTick(() => {
        this.editTableInstance()
          .loadData(data)
          .then(() => {
            this.isLoadData = true
          })
      })
    },
    loadColumns(columns) {
      this.$nextTick(() => {
        this.editTableInstance()
          .loadColumns(columns)
          .then(() => {
            this.isLoadColumns = true
          })
      })
    },
    handleSave(done) {
      this.editTableInstance().validate(valids => {
        if (valids) {
          const { rowIndex, rule } = valids
          done()
          return this.$message.error(`第${rowIndex}行 ${rule.message}`)
        }
        const orderImportDetailDTOList = this.editTableInstance().getRecords()
        const formData = Object.assign(
          { orderImportDetailDTOList: orderImportDetailDTOList.map(v => ({ ...v, id: v.id || 0 })) },
          { orderId: this.orderId }
        )
        updateOrderImportDetail(formData)
          .then(() => {
            this.$message.success('修改成功')
            this.visible = false
            done()
            this.$emit('details-table-save')
            // 刷新表格的时候，保存之前选中的数据
            this.reLoad(true)
          })
          .catch(() => {
            done()
          })
      })
    },
    editTableInstance() {
      return this.$refs.orderDetailsEditTableRef
    }
  }
}
</script>

<template>
  <base-dialog
    custom-class="enter-form-details-table-dialog import-order"
    :visible.sync="visible"
    width="99%"
    title="订单明细编辑"
    @save="handleSave"
  >
    <base-edit-table
      ref="orderDetailsEditTableRef"
      height="600px"
      :show-added="false"
      :show-delete="false"
      :name="constant.TABLE_NAME_IMPORT_ORDER_ENTER"
    />
  </base-dialog>
</template>

<style lang="scss" scoped>
.enter-form-details-table-dialog {
  &.import-order {
    .base-edit-table {
      padding: 0;
    }
  }
}
</style>
