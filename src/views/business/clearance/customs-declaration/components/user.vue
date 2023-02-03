<script>
import enums from '@/enums'
import { clone } from 'xe-utils'
import Grid from './grid'

const form = {
  useOrgPersonCode: '',
  useOrgPersonTel: ''
}

export default {
  name: 'User',
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
          { field: 'useOrgPersonCode', title: '使用单位联系人' },
          { field: 'useOrgPersonTel', title: '使用单位联系电话' }
        ])
        this.$refs.gridRef.loadData(data || [], 'cover')
      })
    },
    handleCurrentChange(row) {
      const { useOrgPersonCode, useOrgPersonTel } = row
      Object.assign(this.form, {
        useOrgPersonCode,
        useOrgPersonTel
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
      this.getUserRecords(data)
    },
    handleMaimDelete() {
      this.$refs.gridRef.handleDelete(() => {
        this.$refs.gridRef.clearCurrentRow()
        this.getUserRecords(this.$refs.gridRef.getVxeGridInstance().getRecords())
      })
    },
    getUserRecords(data) {
      this.$emit('get-user-records', data)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="user-dialog" :visible.sync="visible" width="1000px" title="编辑使用人信息" :show-footer="false">
    <base-form ref="formRef" size="mini">
      <table class="table">
        <tbody>
          <tr>
            <td class="label">使用单位联系人</td>
            <td colspan="3">
              <base-form-item prop="useOrgPersonCode">
                <base-input v-model="form.useOrgPersonCode" :clearable="false" :disabled="disabled" />
              </base-form-item>
            </td>
            <td class="label">使用单位联系电话</td>
            <td colspan="3">
              <base-form-item prop="useOrgPersonTel">
                <base-input v-model="form.useOrgPersonTel" :clearable="false" :disabled="disabled" />
              </base-form-item>
            </td>
          </tr>
        </tbody>
      </table>
    </base-form>
    <div class="table-edit">
      <grid ref="gridRef" height="400px" @current-change="handleCurrentChange" @current-clear="handleCurrentClear">
        <template v-slot:buttons="{ selectRecords }">
          <div v-if="!disabled">
            <el-button size="mini" :disabled="disabled" @click="handleMaimAdded">新增</el-button>
            <el-button size="mini" :disabled="disabled" type="primary" @click="handleMaimSave">保存</el-button>
            <el-button size="mini" :disabled="disabled" @click="handleMaimDelete(selectRecords)">删除</el-button>
          </div>
        </template>
      </grid>
    </div>
  </base-dialog>
</template>

<style lang="scss">
.user-dialog {
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
