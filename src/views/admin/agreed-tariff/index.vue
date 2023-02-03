<!-- 协定关税 -->
<script>
import { getBaseAgreedTariff, deleteBaseAgreedTariffById } from '@/api/base/base-agreed-tariff'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import { mapGetters } from 'vuex'
import BigNumber from '@/utils/big-number'

export default {
  name: 'AgreedTariff',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseAgreedTariff({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'customsCode', title: '海关编码', searchProps: true },
        {
          field: 'agreedRate',
          title: '协定关税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        { field: 'country', title: '国家', searchProps: true },
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
      show: this.permissions[constant.PERMISSION_BASE_AGREED_TARIFF],
      mark: constant.PERMISSION_BASE_AGREED_TARIFF
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_AGREED_TARIFF_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_AGREED_TARIFF_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_AGREED_TARIFF_DEL],
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseAgreedTariffById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['agreedTariffRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['agreedTariffRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="agreed-tariff">
    <!-- 列表页 -->
    <base-page
      ref="agreedTariffRef"
      :name="constant.TABLE_NAME_BASE_AGREED_TARIFF"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
