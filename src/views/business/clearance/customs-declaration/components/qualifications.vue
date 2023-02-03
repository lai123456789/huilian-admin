<script>
import enums from '@/enums'
import constant from '@/constant'
import { clone } from 'xe-utils'
import Grid from './grid'

const form = {
  entQualifName: '',
  entQualifTypeCode: '',
  entQualifNo: ''
}

export default {
  name: 'Qualifications',
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
    },
    defaultCommitment: {
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
      rules: {
        entQualifName: [{ required: true, message: '企业资质类别必填' }]
      },
      commitment: this.defaultCommitment,
      // 勾选下面的复选框需要自动写死这一段数据
      defaultCommitments: [],
      declaratioMaterialCode: ''
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
    createTable(data, defaultCommitments) {
      this.$nextTick(() => {
        let results = data
        this.$refs.gridRef.loadColumns([
          { field: 'entQualifTypeCode', title: '企业资质类别代码' },
          { field: 'entQualifName', title: '企业资质类别名称' },
          { field: 'entQualifNo', title: '企业资质编号' }
        ])

        this.defaultCommitments = defaultCommitments
        if (data && data.length > 0 && data[data.length - 1].entQualifTypeCode === this.defaultCommitments[0].entQualifTypeCode) {
          results = data.slice(0, data.length - 1)
        }

        this.$refs.gridRef.loadData(results || [], 'cover')
      })
    },
    handleCurrentChange(row) {
      const { entQualifTypeCode, entQualifName } = row
      Object.assign(this.form, {
        entQualifTypeCode,
        entQualifName
      })
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
      const results = this.commitment ? [...data, ...this.defaultCommitments] : data
      this.getQualificationsRecords(results)
    },
    handleMaimDelete() {
      this.$refs.gridRef.handleDelete(() => {
        this.$refs.gridRef.clearCurrentRow()
        const data = this.$refs.gridRef.getVxeGridInstance().getRecords()
        const results = this.commitment ? [...data, ...this.defaultCommitments] : data
        this.getQualificationsRecords(results)
      })
    },
    handleCommitmentChange() {
      const data = this.$refs.gridRef.getVxeGridInstance().getRecords()
      const results = this.commitment ? [...data, ...this.defaultCommitments] : data
      this.declaratioMaterialCode = this.commitment ? this.defaultCommitments[0].entQualifTypeCode : ''
      this.getQualificationsRecords(results)
    },
    getQualificationsRecords(data) {
      this.$emit('get-qualifications-records', data, this.declaratioMaterialCode, this.commitment)
    }
  }
}
</script>

<template>
  <base-dialog
    custom-class="qualifications-dialog"
    :visible.sync="visible"
    :rules="rules"
    width="1000px"
    title="编辑企业资质信息"
    :show-footer="false"
  >
    <base-form ref="formRef" size="mini">
      <table class="table">
        <tbody>
          <tr>
            <td class="label">企业资质类别</td>
            <td colspan="3">
              <base-form-item prop="entQualifName" class="non-empty">
                <business-autocomplete-ccl
                  v-model="form.entQualifName"
                  :disabled="disabled"
                  :clearable="false"
                  :module-name="constant.AUTOCOMPLETE_KEY_CCL_COP_LIMIT"
                  label="企业资质类别"
                  placeholder="请选择企业资质类别"
                  value-key="name"
                  :auto-assign="{
                    entQualifTypeCode: 'code'
                  }"
                  :form="form"
                  @clear="() => (form.entQualifTypeCode = '')"
                >
                  <template v-slot="{ option }">
                    <span>{{ `${option.code} ${option.name}` }}</span>
                  </template>
                </business-autocomplete-ccl>
              </base-form-item>
            </td>
            <td class="label">企业资质编号</td>
            <td colspan="3">
              <base-form-item prop="entQualifNo">
                <base-input v-model="form.entQualifNo" :clearable="false" :disabled="disabled" />
              </base-form-item>
            </td>
          </tr>
        </tbody>
      </table>
    </base-form>
    <div class="table-edit">
      <grid ref="gridRef" height="350px" @current-change="handleCurrentChange" @current-clear="handleCurrentClear">
        <template v-slot:buttons="{ selectRecords }">
          <div v-if="!disabled">
            <el-button size="mini" :disabled="disabled" @click="handleMaimAdded">新增</el-button>
            <el-button size="mini" :disabled="disabled" type="primary" @click="handleMaimSave">保存</el-button>
            <el-button size="mini" :disabled="disabled" @click="handleMaimDelete(selectRecords)">删除</el-button>
          </div>
        </template>
      </grid>
    </div>
    <div class="footer">
      <base-checkbox v-model="commitment" :disabled="disabled" @change="handleCommitmentChange" />
      <p>企业承诺：本单位持有海关要求的合格保证、标签标识及其他证明声明材料，知悉相关材料内容，保证符合法律法规要求，并自存留档。</p>
    </div>
  </base-dialog>
</template>

<style lang="scss">
.qualifications-dialog {
  .table {
    width: 100%;
    border: 1px solid #b7b7b7;
    border-collapse: collapse;
    td {
      width: 35%;
      font-size: 12px;
      border: 1px solid #b7b7b7;
    }
    .label {
      padding: 0 10px;
      width: 15%;
      text-align: right;
    }
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__content {
        line-height: 24px;
        margin-left: 0 !important;
      }
      &.non-empty {
        .el-input__inner {
          background-color: #faffbd;
        }
        .is-disabled {
          .el-input__inner {
            background-color: #f5f7fa;
          }
        }
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
  .footer {
    display: flex;
    align-items: center;
    padding-top: 10px;
    > p {
      font-size: 12px;
      color: #ff0000;
    }
  }
}
</style>
