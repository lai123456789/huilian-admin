<!-- 银承管理 -->
<script>
import { getAcctBankAcceptance, deleteAcctBankAcceptanceById } from '@/api/finance/acct-bank-acceptance'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import UpdateArrival from './components/update-arrival'
import UpdateDiscount from './components/update-discount'
import { isFunction } from 'xe-utils'

export default {
  name: 'AcctBankAcceptance',
  components: { EnterForm, Drawer, UpdateArrival, UpdateDiscount },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      updateArrival: {
        visible: false,
        row: {}
      },
      updateDiscount: {
        visible: false,
        row: {}
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getAcctBankAcceptance({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'acceptanceNo', title: '单据编号', searchProps: true },
        { field: 'agreementNo', title: '承兑协议编号' },
        {
          field: 'billType',
          title: '票据类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_BILL_TYPE)
            }
          }
        },
        {
          field: 'acceptanceStatus',
          title: '票据交易状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ACCEPTANCE_STATUS)
            }
          }
        },
        { field: 'arrivalDate', title: '到账日期' },
        { field: 'expiryDate', title: '票据到期日' },
        { field: 'acceptanceCurrency', title: '币别' },
        { field: 'receiptNo', title: '收款单号', searchProps: true },
        { field: 'costInvoiceNo', title: '应收编号', searchProps: true },
        { field: 'payeeName', title: '收款人全称' },
        { field: 'receiptDate', title: '收票日期' },
        { field: 'payeeBankName', title: '收款人开户银行' },
        { field: 'payeeAccount', title: '收款人账号' },
        {
          field: 'acceptanceCompanyType',
          title: '交票人类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: async () => {
                const data = await getDataDictionary(constant.DICTS_PAY_COMPANY_TYPE)
                return data.filter(v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value))
              }
            }
          }
        },
        { field: 'acceptanceCompanyName', title: '交票人全称' },
        { field: 'acceptanceAccount', title: '交票人银行账号' },
        { field: 'drawerName', title: '出票人全称' },
        { field: 'releaseDate', title: '出票日期' },
        { field: 'drawerBankName', title: '出票人开户银行' },
        { field: 'drawerAccount', title: '出票人账号' },
        { field: 'discountName', title: '贴现人' },
        {
          field: 'discountTax',
          title: '贴现税点',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TAX_RATE)
            }
          }
        },
        { field: 'discountRate', title: '贴现率' },
        { field: 'discountInterest', title: '贴现息' },
        { field: 'discountDate', title: '贴现日期' },
        { field: 'discountBankName', title: '贴现银行' },
        {
          field: 'discountCharge',
          title: '贴现手续费',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'discountBearType',
          title: '贴现息承担方',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DISCOUNT_BEAR_TYPE)
            }
          }
        },
        {
          field: 'arrivalMoney',
          title: '到账金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        {
          field: 'acceptanceMoney',
          title: '票面金额',
          sum: true,
          formatter: {
            type: 'number'
          },
          align: 'right'
        },
        { field: 'remark', title: '摘要' },
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
      show: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE],
      mark: constant.PERMISSION_BANK_ACCEPTANCE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '更新到账',
          visible: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_ARRIVAL],
          handler: this.handleUpdateArrival
        },
        {
          label: '更新贴现',
          visible: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_DISCOUNT],
          handler: this.handleUpdateDiscount
        }
      ]
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
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteAcctBankAcceptanceById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['AcctBankAcceptancerRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
            // 第二个参数可能是在page组件下的buttons组件里面定义的loading状态对象，因此需要判断是否为函数
            if (cb && isFunction(cb)) {
              cb()
            }
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      const { acceptanceNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: acceptanceNo
      }
    },
    handleUpdateArrival(rows) {
      const { id: acceptanceId, arrivalDate, arrivalMoney } = rows[0]
      this.updateArrival = {
        visible: true,
        row: {
          acceptanceId,
          arrivalDate,
          arrivalMoney
        }
      }
    },
    handleUpdateDiscount(rows) {
      const {
        id: acceptanceId,
        discountName,
        discountTax,
        discountRate,
        discountInterest,
        discountDate,
        discountCharge,
        discountBearType,
        discountBankName
      } = rows[0]
      this.updateDiscount = {
        visible: true,
        row: {
          acceptanceId,
          discountName,
          discountTax,
          discountRate,
          discountInterest,
          discountDate,
          discountCharge,
          discountBearType,
          discountBankName
        }
      }
    },
    reLoad(isClearSelect) {
      this.$refs['AcctBankAcceptancerRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="acct-bank-acceptance">
    <!-- 列表页 -->
    <base-page
      ref="AcctBankAcceptancerRef"
      :name="constant.TABLE_NAME_ACCT_BANK_ACCEPTANCE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      show-footer
      :search-config="{
        labelWidth: '105px'
      }"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <update-arrival v-model="updateArrival.visible" :table-row="updateArrival.row" :re-load="reLoad" />
    <update-discount v-model="updateDiscount.visible" :table-row="updateDiscount.row" :re-load="reLoad" />
  </div>
</template>
