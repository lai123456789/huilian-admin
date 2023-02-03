<script>
import enums from '@/enums'
import constant from '@/constant'
import { clone } from 'xe-utils'
import Grid from './grid'

const form = {
  containerNo: '',
  containerType: '',
  weight: '',
  lclFlag: '',
  itemNo: ''
}

export default {
  name: 'DetailsDocument',
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
      constant,
      form: clone(form, true),
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      rules: {
        certTypeName: [{ required: true, message: '单证代码必填' }],
        ecoCerNo: [{ required: true, message: '单证编号必填' }],
        relManNo: [
          {
            validator: (rule, value, callback) => {
              if (value !== '') {
                if (String(value).length === 12) {
                  callback()
                } else {
                  callback(new Error('关联备案号必须是12位'))
                }
              } else {
                callback()
              }
            }
          }
        ]
      },
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
    setData(data, dicts) {
      const { customsMasterLicenseDocusVOList } = data
      this.dicts = dicts
      this.$nextTick(() => {
        this.$refs.gridRef.loadColumns([
          { field: 'certTypeName', title: '单证代码' },
          { field: 'ecoCerNo', title: '单证编号' }
        ])
        this.$refs.gridRef.loadData(customsMasterLicenseDocusVOList || [], 'cover')
      })
    },
    handleCurrentChange(row) {
      Object.assign(this.form, row)
    },
    handleCurrentClear() {
      this.form = clone(form, true)
    },
    handleMaimAdded() {
      this.form = clone(form, true)
      this.$refs.gridRef.clearCurrentRow()
    },
    async handleMaimSave() {
      const { data } = await this.$refs.gridRef.getVxeGridInstance().loadData(this.form, 'insert', -1)
      this.form = clone(form, true)
      this.getDocRecords(data)
    },
    handleMaimDelete() {
      this.$refs.gridRef.handleDelete(() => {
        this.$refs.gridRef.clearCurrentRow()
        this.getDocRecords(this.$refs.gridRef.getVxeGridInstance().getRecords())
      })
    },
    getDocRecords(data) {
      this.$emit('get-doc-records', data)
    }
  }
}
</script>

<template>
  <div class="details-document">
    <div class="table-edit">
      <grid ref="gridRef" height="274px" :show-seq="false" @current-change="handleCurrentChange" @current-clear="handleCurrentClear">
        <template v-slot:buttons="{ selectRecords }">
          <div v-if="!disabled">
            <el-button size="mini" :disabled="disabled" @click="handleMaimAdded">新增</el-button>
            <el-button size="mini" :disabled="disabled" type="primary" @click="handleMaimSave">保存</el-button>
            <el-button size="mini" :disabled="disabled" type="danger" @click="handleMaimDelete(selectRecords)">删除</el-button>
          </div>
        </template>
      </grid>
    </div>
    <base-form ref="formRef" size="mini" :disabled="disabled">
      <div class="customs-wrap">
        <!-- 第1行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>单证代码</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item class="non-empty" prop="certTypeName">
                <business-autocomplete-ccl
                  v-model="form.certTypeName"
                  :disabled="disabled"
                  :clearable="false"
                  label="单证代码"
                  placeholder="请输入单证代码"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_LICENSE_DOCU"
                  :auto-assign="{
                    certTypeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.certTypeCode = void 0)"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第2行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>单证编号</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item class="non-empty" prop="ecoCerNo">
                <base-input v-model="form.ecoCerNo" :disabled="disabled" placeholder="请输入单证编号" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第3行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>关联报关单</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="relId">
                <base-input v-model="form.relId" :disabled="disabled" placeholder="请输入关联报关单" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第4行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>关联备案</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="relManNo">
                <base-input v-model="form.relManNo" :disabled="disabled" placeholder="请输入关联备案" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第5行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>保税/监管场地</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="bonNo">
                <base-input v-model="form.bonNo" :disabled="disabled" placeholder="请输入保税/监管场地" />
              </base-form-item>
            </div>
          </div>
        </div>
        <!-- 第6行 -->
        <div class="customs-row">
          <div class="customs-col customs-label">
            <div>场地代码</div>
          </div>
          <div class="customs-col">
            <div class="cell">
              <base-form-item prop="cusFie">
                <base-input v-model="form.cusFie" :disabled="disabled" placeholder="请输入场地代码" />
              </base-form-item>
            </div>
          </div>
        </div>
      </div>
    </base-form>
  </div>
</template>

<style lang="scss" scoped>
.details-document {
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
}
</style>
