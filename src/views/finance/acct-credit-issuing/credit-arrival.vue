<!-- 到单 -->
<script>
import { getAcctLetterOfCreditArrival, deleteAcctLetterOfCreditArrivalById } from '@/api/finance/acct-letter-of-credit-arrival'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormCreditArrival from './components/enter-form-credit-arrival'
import { mapGetters } from 'vuex'

export default {
  name: 'CreditArrival',
  components: { EnterFormCreditArrival },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctLetterOfCreditArrival({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                creditId: this.tableRow.id
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'arrivalNo', title: '到单编号' },
        { field: 'arrivalDate', title: '到单日期' },
        { field: 'currencyName', title: '到单币别' },
        {
          field: 'arrivalMoney',
          title: '到单金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'payNo', title: '付款单编号' },
        { field: 'acceptanceDate', title: '最迟确认日期' },
        { field: 'payDate', title: '最迟付款日期' },
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
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_ISSUING_ARRIVAL_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_ISSUING_ARRIVAL_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_ACCT_CREDIT_ISSUING_ARRIVAL_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded(row) {
      this.mainRow = row
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
          deleteAcctLetterOfCreditArrivalById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['creditArrivalRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['creditArrivalRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="credit-arrival">
    <!-- 列表页 -->
    <base-page
      ref="creditArrivalRef"
      :name="constant.TABLE_NAME_ACCT_CREDIT_ISSUING_ARRIVAL"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-credit-arrival
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
