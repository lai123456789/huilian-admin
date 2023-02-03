<!-- 客户额度池 -->
<script>
import { getRiskCusQuota } from '@/api/risk/risk-cus-quota'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'CusQuota',
  components: {},
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getRiskCusQuota({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'quotaType',
          title: '额度类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_QUOTA_TYPE)
            }
          }
        },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'currencyName', title: '额度币别' },
        {
          field: 'totalMoney',
          title: '总额度',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'useMoney',
          title: '已使用额度',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_QUOTA],
      mark: constant.PERMISSION_QUOTA
    }
    this.buttonsConfig = {}
  },
  methods: {}
}
</script>

<template>
  <div class="cus-quota">
    <!-- 列表页 -->
    <base-page
      ref="cusQuotaRef"
      :name="constant.TABLE_NAME_QUOTA"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
    />
  </div>
</template>
