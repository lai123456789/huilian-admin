<!-- 操作日志 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'OperRecord',
  components: {},
  props: {
    tableRow: Object,
    operRecordConfig: Object
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
        const { data } = await this.operRecordConfig.pagePort({
          ...pager,
          ...transforArrayPayload(params),
          businessId: this.tableRow.id
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'createByName', title: '创建人', searchProps: true, width: 150 },
        { field: 'createTime', title: '创建时间', width: 150 },
        { field: 'operContent', title: '内容', searchProps: true }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {},
  methods: {
    reLoad(isClearSelect) {
      this.$refs['operRecordRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="oper-record">
    <!-- 列表页 -->
    <base-page
      ref="operRecordRef"
      :name="constant.TABLE_NAME_COMMOM_OPR_RECORDS"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />
  </div>
</template>
