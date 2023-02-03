<script>
import { getCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'

export default {
  name: 'ContainerItemNo',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    itemNo: String,
    params: Object
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
          { field: 'codeTS', title: '商品编号' },
          { field: 'productName', title: '商品名称' }
        ]
        this.request = async ({ pager, params }) => {
          const { data } = await getCustomsMasterDetail({
            ...pager,
            ...transforArrayPayload(Object.assign(this.params, params, { size: -1 }))
          })

          if (this.isOnce) {
            const itemNos = this.itemNo.split(',')
            this.$refs.containerItemNoRef?.setTableCheckRowKeys(itemNos.map(v => ({ gNo: Number(v) })))
            this.isOnce = false
          }

          return Promise.resolve({
            data: data.records,
            total: data.total
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
      this.$refs['containerItemNoRef'].refresh(isClearSelect)
    },
    handleSave(done) {
      this.$emit('save', this.$refs.containerItemNoRef.getCheckboxRecords(), done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="container-item-no-dialog" :visible.sync="visible" width="800px" title="编辑商品项号关系" @save="handleSave">
    <div class="container-item-no">
      <base-page
        v-if="showPage"
        ref="containerItemNoRef"
        key-field="gNo"
        :name="constant.TABLE_NAME_CUSTOMS_DECLARATION_ITEN_NO"
        :tools-config="{
          setting: {
            visible: false
          },
          download: {
            visible: false
          }
        }"
        :show-pager="false"
        show-footer
        :columns="columns"
        :request="request"
      />
    </div>
  </base-dialog>
</template>

<style lang="scss">
.container-item-no-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .container-item-no {
    height: 60vh;
  }
}
</style>
