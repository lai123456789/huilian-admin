<script>
import { getBaseCclWrapType } from '@/api/base/base-ccl-wrap-type'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'OtherWrapType',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      constant,
      visible: this.value,
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseCclWrapType({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'code', title: '包装种类代码', searchProps: true },
        { field: 'name', title: '包装种类名称', searchProps: true },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ]
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleCellDbclick($table) {
      this.$emit('cell-dblclick', $table)
    },
    reLoad(isClearSelect) {
      this.$refs['otherWrapTypeRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="other-wrap-type-dialog" :show-footer="false" width="1000px" title="其他包装">
    <!-- 列表页 -->
    <base-page
      ref="otherWrapTypeRef"
      :name="constant.TABLE_NAME_CUS_PACKING_TYPE"
      :columns="columns"
      :request="request"
      :search-config="{
        labelWidth: '120px'
      }"
      :tools-config="{
        setting: {
          visible: false
        },
        download: {
          visible: false
        }
      }"
      @cell-dblclick="handleCellDbclick"
    />
  </base-dialog>
</template>

<style lang="scss">
.other-wrap-type-dialog {
  .base-dialog-body {
    padding: 0;
    height: 70vh;
  }
}
</style>
