<script>
import enums from '@/enums'
import constant from '@/constant'
import { clone } from 'xe-utils'
import Grid from './grid'
import ContainerItemNo from './container-item-no.vue'

const form = {
  containerNo: '',
  containerType: '',
  weight: void 0,
  lclFlag: '',
  itemNo: ''
}

export default {
  name: 'DetailsContainer',
  components: { Grid, ContainerItemNo },
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
      constant,
      form: clone(form, true),
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      dicts: {},
      isClickMore: false,
      currentRow: {},
      containerItemNo: {
        visible: false,
        params: {
          customsId: 0
        }
      }
    }
  },
  computed: {
    weight: {
      get() {
        return this.form.weight === null ? void 0 : this.form.weight
      },
      set(value) {
        this.form.weight = value === void 0 ? null : value
        this.currentRow.weight = this.form.weight === null ? '' : this.form.weight
      }
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
    setData(data, dicts) {
      this.currentRow = {}
      this.form = clone(form, true)
      const { customsTransportVO } = data
      this.dicts = dicts
      this.$nextTick(() => {
        this.$refs.gridRef.loadColumns([
          { field: 'containerNo', title: '集装箱号' },
          {
            field: 'containerType',
            title: '集装箱规格',

            formatter: {
              type: 'options',
              config: {
                options: () => dicts[constant.DICTS_CONTAINER_TYPE]
              }
            }
          },
          {
            field: 'lclFlag',
            title: '拼箱标识',

            formatter: {
              type: 'options',
              config: {
                options: () => dicts[constant.DICTS_WHETHER_STATUS]
              }
            }
          }
        ])
        this.$refs.gridRef.loadData(customsTransportVO ? customsTransportVO.customsTransportDetailVOList || [] : [], 'cover')
      })
    },
    handleMoreClick() {
      if (!this.disabled && this.isClickMore) {
        this.containerItemNo.visible = true
        this.containerItemNo.params = {
          customsId: this.tableRow.id
        }
      }
    },
    handleCurrentChange(row) {
      Object.assign(this.form, row)
      this.currentRow = row
      this.isClickMore = true
    },
    handleCurrentClear() {
      this.form = clone(form, true)
      this.currentRow = {}
      this.isClickMore = false
    },
    handleContainerItemNoSave(data, done) {
      this.form.itemNo = data
        .map(v => Number(v.gNo))
        .sort((a, b) => a - b)
        .join(',')
      this.currentRow.itemNo = this.form.itemNo
      done()
      this.containerItemNo.visible = false
    },
    getVxeGridInstance() {
      return this.$refs.gridRef
    }
  }
}
</script>

<template>
  <div class="details-container">
    <div class="table-edit">
      <grid ref="gridRef" height="274px" :show-seq="false" @current-change="handleCurrentChange" @current-clear="handleCurrentClear"></grid>
    </div>
    <base-form ref="formRef" size="mini">
      <div class="customs-wrap">
        <!-- 第1行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>集装箱号</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="containerNo">
                <base-input v-model="form.containerNo" disabled :clearable="false" placeholder="请输入集装箱号" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第2行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>集装箱规格</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="containerType">
                <base-select
                  v-model="form.containerType"
                  :clearable="false"
                  disabled
                  :options="dicts[constant.DICTS_CONTAINER_TYPE]"
                  placeholder="请选择"
                />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第3行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>自重(KG)</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="weight">
                <base-input-number v-model="weight" :disabled="disabled || !isClickMore" placeholder="请输入自重(KG)" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第4行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>拼箱标识</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="lclFlag">
                <base-select
                  v-model="form.lclFlag"
                  :clearable="false"
                  disabled
                  :options="dicts[constant.DICTS_WHETHER_STATUS]"
                  placeholder="请选择"
                />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第5行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>商品项号关系</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="itemNo">
                <base-input
                  v-model="form.itemNo"
                  class="base-input-item-no"
                  :disabled="disabled || !isClickMore"
                  readonly
                  placeholder="请输入商品项号关系"
                >
                  <template slot="append">
                    <i class="el-icon-more" @click.stop="handleMoreClick"></i>
                  </template>
                </base-input>
              </base-form-item>
            </div>
          </div>
        </div>
      </div>
    </base-form>
    <container-item-no
      v-model="containerItemNo.visible"
      :item-no="form.itemNo"
      :params="containerItemNo.params"
      @save="handleContainerItemNoSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.details-container {
  margin-bottom: 3px;
  border: 1px solid #b7b7b7;
  border-bottom: 0;
  .table-edit {
    ::v-deep .base-edit-table {
      padding: 0;
    }
    ::v-deep .vxe-grid--toolbar-wrapper {
      .el-button {
        margin-top: 3px;
        margin-bottom: 3px;
        padding: 5px 12px;
        + .el-button {
          margin-left: 3px;
        }
      }
    }
  }
  .customs-wrap {
    width: 100%;
    border-top: 1px solid #b7b7b7;
    // border-right: 1px solid #b7b7b7;
    .customs-row {
      display: flex;
      width: 100%;
      font-size: 12px;
      .customs-col {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #b7b7b7;
        border-left: 1px solid #b7b7b7;
        flex: 1;
        .cell {
          width: 100%;
          ::v-deep .el-form-item--mini.el-form-item {
            margin-bottom: 0;
            .el-form-item__content {
              line-height: 24px;
            }
          }
          ::v-deep .el-input__inner {
            padding-right: 4px !important;
            padding-left: 4px;
            height: 24px;
            border: none;
            border-color: transparent;
            line-height: 24px;
          }
          ::v-deep .el-input__icon {
            line-height: 24px;
          }
        }
        &.customs-label {
          justify-content: flex-end;
          padding-right: 5px;
          width: 10%;
          width: 100px;
          border-left: none;
          flex: none;
        }
      }
    }
  }
  ::v-deep .base-form-item {
    .base-input-item-no {
      .el-input-group__append {
        padding: 0 5px;
        cursor: pointer;
      }
    }
  }
}
</style>
