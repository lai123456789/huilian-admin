<script>
import { getAcctBankAcceptanceById } from '@/api/finance/acct-bank-acceptance'
import { getAcctBankAcceptanceEndosement } from '@/api/finance/acct-bank-acceptance-endosement'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import UpdateArrival from './components/update-arrival'
import UpdateDiscount from './components/update-discount'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  components: { EnterForm, UpdateArrival, UpdateDiscount },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    deleteFn: {
      type: Function,
      default: () => () => {}
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      form: {
        id: 0,
        drawerName: '',
        drawerBankName: '',
        drawerAccount: '',
        acceptanceCompanyType: '',
        acceptanceCompanyName: '',
        acceptanceCompanyId: 0,
        acceptanceAccount: '',
        payeeName: '',
        payeePrincipalCompanyId: 0,
        payeeBankName: '',
        payeeAccount: '',
        payeePrincipalId: 0,
        remark: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      updateArrival: {
        visible: false,
        row: {}
      },
      updateDiscount: {
        visible: false,
        row: {}
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      showBtns: {
        edit: false,
        del: false,
        gxdz: false,
        gxtx: false
      },
      dicts: {},
      showPage: false,
      rightLabelWidth: '70px',
      columns: [],
      request: async ({ pager, params }) => {
        const { data } = await getAcctBankAcceptanceEndosement({
          ...pager,
          ...transforArrayPayload(Object.assign({ acceptanceId: this.tableRow.id }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      payCompanyTypes: []
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    acceptanceCompanyModuleName() {
      let moduleName = ''
      switch (this.form.acceptanceCompanyType) {
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMER'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('SUPPLIER'):
          moduleName = constant.AUTOCOMPLETE_KEY_SUPPLIER
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('TRANSPORT'):
          moduleName = constant.AUTOCOMPLETE_KEY_TRANSPORT
          break
        case enums.PAY_COMPANY_TYPE.getFieldByKey('CUSTOMS'):
          moduleName = constant.AUTOCOMPLETE_KEY_CUSTOMS
          break
      }
      return moduleName
    }
  },
  mounted() {
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        const { DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_BILL_TYPE, DICTS_ACCEPTANCE_STATUS, DICTS_PAY_COMPANY_TYPE, DICTS_DISCOUNT_BEAR_TYPE]),
          getAcctBankAcceptanceById(this.tableRow.id)
        ]).then(([dicts, info]) => {
          const { createByName, createTime } = info.data
          this.dicts = dicts
          this.payCompanyTypes = this.dicts[DICTS_PAY_COMPANY_TYPE].filter(
            v => ![enums.PAY_COMPANY_TYPE.getFieldByKey('FUNDERS')].includes(v.value)
          )

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, info.data)

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_EDIT],
            del: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_DEL],
            gxdz: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_ARRIVAL],
            gxtx: this.permissions[constant.PERMISSION_BANK_ACCEPTANCE_UPDATE_DISCOUNT]
          }

          this.columns = this.handleDetailsColumns()

          if (isFunction(cb)) cb()
          this.showPage = true
          this.loading = false
        })
      })
    },
    /** 明细列数据 */
    handleDetailsColumns() {
      return [
        { field: 'endorserName', title: '背书人全称' },
        { field: 'endorsementDate', title: '背书日期' },
        { field: 'endorseeName', title: '被背书人全称' }
      ]
    },
    handleUpdateArrival() {
      const { id: acceptanceId, arrivalDate, arrivalMoney } = this.form
      this.updateArrival = {
        visible: true,
        row: {
          acceptanceId,
          arrivalDate,
          arrivalMoney
        }
      }
    },
    handleUpdateDiscount() {
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
      } = this.form
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
    handleEdit() {
      this.enterForm.visible = true
    },
    handleDelete() {
      this.deleteFn()
    },
    // 修改某一项时，刷新列表页和详情页
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate acct-bank-acceptance is-details-adaptive"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="100px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="票据类型" prop="billType">
                    <base-select v-model="form.billType" disabled placeholder="请选择票据类型" :options="dicts[constant.DICTS_BILL_TYPE]" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="票据号码" prop="billNo">
                    <base-input v-model="form.billNo" disabled placeholder="请选择票据号码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="票据到期日" prop="expiryDate">
                    <base-date-picker v-model="form.expiryDate" disabled type="date" placeholder="选择票据到期日" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收票日期" prop="receiptDate">
                    <base-date-picker v-model="form.receiptDate" disabled type="date" placeholder="选择收票日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="出票日期" prop="releaseDate">
                    <base-date-picker v-model="form.releaseDate" disabled type="date" placeholder="选择出票日期" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="币别" prop="acceptanceCurrency">
                    <business-autocomplete-basic
                      v-model="form.acceptanceCurrency"
                      disabled
                      label="币别"
                      placeholder="请输入币别"
                      :module-name="constant.AUTOCOMPLETE_KEY_CURRENCY"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="票面金额" prop="acceptanceMoney">
                    <base-input-number v-model="form.acceptanceMoney" disabled placeholder="请输入票面金额" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="承兑协议编号" prop="agreementNo">
                    <base-input v-model="form.agreementNo" disabled placeholder="请输入承兑协议编号" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="12">
                  <base-form-item label="摘要" prop="remark">
                    <base-input v-model="form.remark" disabled type="textarea" placeholder="请输入摘要" />
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!-- 票面信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                票面信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="出票人全称" prop="drawerName">
                    <base-input v-model="form.drawerName" disabled placeholder="请输入出票人全称" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="出票人开户银行" prop="drawerBankName">
                    <base-input v-model="form.drawerBankName" disabled placeholder="请输入出票人开户银行" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="出票人账号" prop="drawerAccount">
                    <base-input v-model="form.drawerAccount" disabled placeholder="请输入出票人账号" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="交票人类型" prop="acceptanceCompanyType">
                    <base-select v-model="form.acceptanceCompanyType" disabled placeholder="请选择交票人类型" :options="payCompanyTypes" />
                  </base-form-item>
                </base-col>

                <base-col v-if="form.acceptanceCompanyType" :span="6">
                  <base-form-item label="交票人" prop="acceptanceCompanyName">
                    <business-autocomplete-basic
                      v-model="form.acceptanceCompanyName"
                      label="交票人"
                      disabled
                      placeholder="请输入交票人"
                      :module-name="acceptanceCompanyModuleName"
                      :auto-assign="{
                        acceptanceCompanyId: 'companyId'
                      }"
                      :form="form"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="交票人银行账号" prop="acceptanceAccount">
                    <base-input v-model="form.acceptanceAccount" disabled placeholder="请输入交票人银行账号" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="收款人主体" prop="payeeName">
                    <business-autocomplete-basic
                      v-model="form.payeeName"
                      label="收款人主体"
                      disabled
                      placeholder="请输入收款人主体"
                      :module-name="constant.AUTOCOMPLETE_KEY_PRINCIPAL"
                    ></business-autocomplete-basic>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款人开户银行" prop="payeeBankName">
                    <business-autocomplete-bank
                      v-model="form.payeeBankName"
                      value-key="bankName"
                      disabled
                      label="收款人开户银行"
                      placeholder="请输入收款人开户银行"
                      :params="{
                        companyId: form.payeePrincipalCompanyId
                      }"
                    ></business-autocomplete-bank>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="收款人账号" prop="payeeAccount">
                    <base-input v-model="form.payeeAccount" disabled placeholder="请输入收款人账号"></base-input>
                  </base-form-item>
                </base-col>
              </base-row>
            </div>

            <!--背书信息 -->
            <div class="common-operate-block is-special">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                背书信息
              </span>
              <div class="common-operate-block-body">
                <base-page
                  v-if="showPage"
                  ref="detailsRef"
                  :request="request"
                  :columns="columns"
                  :tools-config="{
                    setting: {
                      visible: false
                    },
                    download: {
                      visible: false
                    }
                  }"
                  show-footer
                  :name="constant.TABLE_NAME_ACCT_BANK_ACCEPTANCE_DETAILS"
                />
              </div>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">创建信息</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建人:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建时间:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <el-button v-if="showBtns.gxdz" icon="el-icon-s-operation" type="primary" @click="handleUpdateArrival">更新到账</el-button>
        <el-button v-if="showBtns.gxtx" icon="el-icon-s-operation" type="primary" @click="handleUpdateDiscount">更新贴现</el-button>
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >删除</el-button
        >
        <el-button
          v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-edit"
          type="warning"
          @click="handleEdit"
          >编辑</el-button
        >
      </div>
    </div>
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="{ id: tableRow.id }" :re-load="handleUpdateInfoReload" />
    <update-arrival v-model="updateArrival.visible" :table-row="updateArrival.row" :re-load="reLoad" />
    <update-discount v-model="updateDiscount.visible" :table-row="updateDiscount.row" :re-load="reLoad" />
  </div>
</template>

<style lang="scss" scoped>
.acct-bank-acceptance {
  .common-operate-l {
    overflow: inherit;
    width: calc(100% - 240px);
    &-audit {
      padding: 10px 10px 0 10px;
    }
    &-main {
      overflow: auto;
    }
  }
  .common-operate-block-body {
    min-height: 350px;
  }
  .common-operate-block {
    &.is-special {
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
  }
}
</style>
