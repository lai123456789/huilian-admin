<template>
  <div class="base-table-pager">
    <el-pagination
      background
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :disabled="basePage.loading"
      :total="basePage.total"
      :page-size="basePage.pager.size"
      :current-page="basePage.pager.current"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: 'BaseTablePager',
  inject: ['basePage'],
  data() {
    return {
      pagerCount: 5,
      pageSizes: [20, 50, 100],
      layout: ['total', 'sizes', 'prev', 'next', 'jumper'].join(',')
    }
  },
  methods: {
    handleSizeChange(v) {
      this.$emit('size-change', v)
    },
    handleCurrentChange(v) {
      this.$emit('current-change', v)
    }
  }
}
</script>

<style lang="scss">
.base-table-pager {
  padding: 8px 10px 0;
  text-align: right;
  box-sizing: border-box;
  .el-pagination__jump {
    margin-left: 10px !important;
  }
}
</style>
