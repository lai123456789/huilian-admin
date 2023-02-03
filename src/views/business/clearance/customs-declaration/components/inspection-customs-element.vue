<script>
import enums from '@/enums'
import { clone } from 'xe-utils'
import Grid from './grid'

const form = {
  tradeNameEn: '',
  tradeName: '',
  tradeNameAddress: '',
  date: '',
  productNameEn: ''
}

export default {
  name: 'InspectionCustomsElement',
  components: { Grid },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      enums,
      form: clone(form, true),
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      dicts: {}
    }
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
    createTable(data) {
      this.$nextTick(() => {
        this.$refs.gridRef.loadColumns([
          { field: 'code', title: '证书代码' },
          { field: 'name', title: '证书名称' },
          {
            field: 'originalNum',
            title: '正本数量',
            type: 'inputNumber',
            attrs: {
              precision: 6
            }
          },
          {
            field: 'copyNum',
            title: '副本数量',
            type: 'inputNumber',
            attrs: {
              precision: 6
            }
          }
        ])
        this.$refs.gridRef.loadData(data || [], 'cover')
      })
    },
    getInspectionCustomsElementRecords(data) {
      this.$emit('save', data)
    }
  }
}
</script>

<template>
  <base-dialog
    custom-class="inspection-customs-element-dialog"
    :visible.sync="visible"
    width="1000px"
    title="检验检疫签证申报要素"
    :show-footer="false"
  >
    <div class="table-edit">
      <grid ref="gridRef" height="300px" />
    </div>
    <base-form ref="formRef" size="mini">
      <table class="table">
        <tbody>
          <tr>
            <td class="label">境内收发货人名称(外文)</td>
            <td colspan="3">
              <base-form-item prop="tradeNameEn">
                <base-input v-model="form.tradeNameEn" placeholder="境内收发货人名称(外文)" :disabled="disabled" />
              </base-form-item>
            </td>
          </tr>

          <tr>
            <td class="label">境外收发货人名称(中文)</td>
            <td colspan="3">
              <base-form-item prop="tradeName">
                <base-input v-model="form.tradeName" placeholder="境外收发货人名称(中文)" :disabled="disabled" />
              </base-form-item>
            </td>
          </tr>

          <tr>
            <td class="label">境外发货人地址</td>
            <td colspan="3">
              <base-form-item prop="tradeNameAddress">
                <base-input v-model="form.tradeNameAddress" placeholder="境外发货人地址" :disabled="disabled" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="label">卸毕日期</td>
            <td colspan="3">
              <base-form-item prop="date">
                <base-date-picker v-model="form.date" :disabled="disabled" placeholder="请输入卸毕日期" />
              </base-form-item>
            </td>
          </tr>
          <tr>
            <td class="label">商品英文名称</td>
            <td colspan="3">
              <base-form-item prop="productNameEn">
                <base-input v-model="form.productNameEn" placeholder="商品英文名称" disabled />
              </base-form-item>
            </td>
          </tr>
        </tbody>
      </table>
    </base-form>
  </base-dialog>
</template>

<style lang="scss">
.inspection-customs-element-dialog {
  .table {
    width: 100%;
    border: 1px solid #b7b7b7;
    border-collapse: collapse;
    td {
      width: 20%;
      font-size: 12px;
      border: 1px solid #b7b7b7;
    }
    .label {
      padding: 0 10px;
      width: 5%;
      text-align: right;
    }
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__content {
        line-height: 24px;
        margin-left: 0 !important;
      }
    }
    .el-input__suffix {
      display: none;
    }
    .el-input--suffix .el-input__inner {
      padding-right: 4px !important;
      padding-left: 4px;
    }
    .el-input__inner {
      padding-right: 4px !important;
      padding-left: 4px;
      height: 24px;
      border-color: transparent;
      line-height: 24px;
    }
  }
  .table-edit {
    .base-edit-table {
      padding: 0;
    }
    .vxe-grid--toolbar-wrapper {
      .el-button {
        margin-top: 3px;
        margin-bottom: 3px;
        + .el-button {
          margin-left: 3px;
        }
      }
    }
  }
}
</style>
