<script>
import { previewVoucherAcctVoucher } from '@/api/finance/acct-voucher'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import ReceiptContentViewr from './receipt-content-viewr'
import enums from '@/enums'

const form = {
  voucherStatus: '',
  voucherNo: '',
  voucherWord: '',
  voucherDate: '',
  companyNo: '',
  companyName: '',
  receiptContent: '',
  assistItemList: []
}

export default {
  name: 'Voucher',
  components: { ReceiptContentViewr },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      show: false,
      tableConfig: {
        size: 'mini',
        border: true,
        resizable: true,
        autoResize: true,
        height: '400px',
        columns: [
          {
            type: 'seq',
            align: 'center',
            title: '序号',
            width: 50
          },
          {
            field: 'summary',
            title: '摘要',
            width: 150
          },
          {
            field: 'subjectName',
            title: '科目',
            width: 250
          },
          {
            field: 'currencyName',
            title: '币别',
            width: 80
          },
          {
            field: 'rate',
            title: '汇率',
            width: 100
          },
          {
            field: 'originalAmount',
            title: '原币金额',
            align: 'right',
            width: 120
          },
          {
            field: 'debtor',
            title: '借方',
            align: 'right',
            width: 120
          },
          {
            field: 'credit',
            title: '贷方',
            align: 'right',
            width: 120
          }
        ],
        data: []
      },
      form: clone(form, true),
      dicts: {},
      voucherStauts: [],
      enumerations: [{ dictName: 'voucher_stauts', field: 'voucherStauts' }],
      receiptContent: {
        visible: false
      }
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.form = clone(form, true)
        Promise.all([getDataDictionary([])]).then(([dicts]) => {
          this.dicts = dicts
          this.generatePreview()
        })
      }
    },
    show(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 生成预览数据
    generatePreview() {
      previewVoucherAcctVoucher({ templateNo: this.row.templateNo, recordId: this.row.record_id })
        .then(res => {
          const { voucherStatus, voucherNo, voucherWord, voucherDate, companyNo, companyName, receiptContent, assistItemList } = res.data
          const acctVoucherEntryVOList = res.data.acctVoucherEntryVOList
          this.form = Object.assign(clone(form, true), {
            voucherStatus,
            voucherNo,
            voucherWord,
            voucherDate,
            companyNo,
            companyName,
            receiptContent,
            assistItemList: assistItemList || []
          })
          this.tableConfig.data = acctVoucherEntryVOList.map(item => ({
            ...item,
            subjectName: `${item.subjectNo} - ${item.subjectName}`,
            debtor: item['borrowType'] === enums.BORROW_TYPE.getFieldByKey('BORROW') ? item['baseAmount'] : '',
            credit: item['borrowType'] === enums.BORROW_TYPE.getFieldByKey('LENT') ? item['baseAmount'] : ''
          }))
          this.show = true
        })
        .catch(() => {
          this.$emit('update:visible', false)
        })
    },
    formatOptions(value, options = []) {
      const target = options.find(v => v.value === value)
      return target ? target.label : value
    },
    handleReceiptContentViewr() {
      this.receiptContent.visible = true
    }
  }
}
</script>

<template>
  <div>
    <base-dialog :visible.sync="show" custom-class="voucher-viewr-dialog" width="80%" title="查看" :show-save="false">
      <div class="voucher-viewr-header">
        <base-form v-if="show" ref="form" :show-message="false" disabled :model="form" label-suffix=":" label-width="70px" size="mini">
          <base-row>
            <base-col :span="6">
              <base-form-item label="凭证状态">
                <div class="voucher-viewr-item">{{ formatOptions(form.voucherStatus, voucherStauts) || '-' }}</div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="凭证号">
                <div class="voucher-viewr-item">{{ form.voucherNo || '-' }}</div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="凭证字">
                <div class="voucher-viewr-item">{{ form.voucherWord || '-' }}</div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="凭证日期">
                <div class="voucher-viewr-item">{{ form.voucherDate || '-' }}</div>
              </base-form-item>
            </base-col>

            <base-col :span="6">
              <base-form-item label="账套编码">
                <div class="voucher-viewr-item">{{ form.companyNo || '-' }}</div>
              </base-form-item>
            </base-col>

            <base-col :span="18">
              <base-form-item label="账套名称">
                <div class="voucher-viewr-item">{{ form.companyName || '-' }}</div>
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>
      </div>
      <div class="voucher-viewr-table">
        <vxe-grid v-bind="tableConfig">
          <template v-slot:empty>
            <base-empty></base-empty>
          </template>
        </vxe-grid>
      </div>
      <div class="voucher-viewr-footer">
        <base-form v-if="show" ref="form" :show-message="false" disabled :model="form" label-suffix=":" label-width="70px" size="mini">
          <base-row>
            <base-col v-for="(item, index) in form.assistItemList" :key="index" :span="6">
              <base-form-item :label="item.lable">
                <div class="voucher-viewr-item">
                  <base-input v-model="item.code" readonly style="width: 70px" />
                  <div class="voucher-viewr-item-value">{{ item.value || '-' }}</div>
                </div>
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>
      </div>
      <template v-slot:footer>
        <div class="dialog-footer-operate">
          <el-button type="primary" size="small" @click="handleReceiptContentViewr">查看回执内容</el-button>
        </div>
      </template>
    </base-dialog>
    <receiptContentViewr :visible.sync="receiptContent.visible" :receipt-content="form.receiptContent"></receiptContentViewr>
  </div>
</template>

<style lang="scss">
$prefix: voucher-viewr;
.#{$prefix} {
  &-dialog {
    .#{$prefix}-item {
      display: flex;
      align-items: center;
      &-value {
        display: inline-block;
        padding-left: 5px;
        font-size: 12px;
      }
    }
    .#{$prefix}-footer {
      padding-top: 10px;
    }
    .#{$prefix}-table {
      width: 100%;
      .vxe-body--column {
        .vxe-cell {
          display: flex;
          align-items: center;
          min-height: 70px;
        }
        &.col--center {
          .vxe-cell {
            justify-content: center;
          }
        }
        &.col--right {
          .vxe-cell {
            justify-content: flex-end;
          }
        }
      }
    }
    .el-dialog__body {
      .base-dialog-footer {
        display: flex;
      }
      .dialog-footer-operate {
        flex: 1;
        display: flex;
      }
    }
  }
}
</style>
