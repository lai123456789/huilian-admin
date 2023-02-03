<!-- 仓库默认配置 -->
<script>
import { updatePublicValueSysPublicParam, publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  warehouseImportRkId: 0,
  warehouseImportRkName: '',
  warehouseImportCkId: 0,
  warehouseImportCkName: '',
  warehouseExportRkId: '',
  warehouseExportRkName: '',
  warehouseExportCkId: 0,
  warehouseExportCkName: '',
  warehouseDomesticId: '',
  warehouseDomesticName: '',
  warehouseOutsideId: '',
  warehouseOutsideName: ''
}

export default {
  name: 'DefaultWarehouse',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    templateKey: String,
    title: String,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      enums,
      constant,
      // ----------- 固定定义 -----------
      visible: this.value,
      // ----------- 固定定义 -----------
      form: clone(form, true),
      rules: {},
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
  mounted() {
    // 点进来立马的触发一下弹窗高度刷新
    this.$refs.dialogRef.handleResize()
    this.form = clone(form, true)
    Promise.all([getDataDictionary([]), publicValueSysPublicParamByPublicKey(this.templateKey)]).then(([dicts, info]) => {
      this.dicts = dicts
      Object.assign(this.form, info.data)
    })
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          updatePublicValueSysPublicParam({ publicKey: this.templateKey, publicValue: JSON.stringify(this.form) })
            .then(() => {
              this.$message.success('操作成功')
              this.visible = false
              done()
              // 刷新表格的时候，保存之前选中的数据
              this.reLoad(true)
            })
            .catch(() => {
              done()
            })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    getFormInstance() {
      return this.$refs.formRef
    }
  }
}
</script>

<template>
  <base-dialog ref="dialogRef" :visible.sync="visible" width="500px" :title="title" @save="handleSave">
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="进口入库仓库" prop="warehouseImportRkName">
            <business-autocomplete-warehouse
              v-model="form.warehouseImportRkName"
              value-key="warehouseName"
              label="进口入库仓库"
              placeholder="请输入进口入库仓库"
              :auto-assign="{
                warehouseImportRkId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseImportRkId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="进口出库仓库" prop="warehouseImportCkName">
            <business-autocomplete-warehouse
              v-model="form.warehouseImportCkName"
              value-key="warehouseName"
              label="进口出库仓库"
              placeholder="请输入进口出库仓库"
              :auto-assign="{
                warehouseImportRkId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseImportRkId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="出口入库仓库" prop="warehouseExportRkName">
            <business-autocomplete-warehouse
              v-model="form.warehouseExportRkName"
              value-key="warehouseName"
              label="出口入库仓库"
              placeholder="请输入出口入库仓库"
              :auto-assign="{
                warehouseExportRkId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseExportRkId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="出口出库仓库" prop="warehouseExportCkName">
            <business-autocomplete-warehouse
              v-model="form.warehouseExportCkName"
              value-key="warehouseName"
              label="出口出库仓库"
              placeholder="请输入出口出库仓库"
              :auto-assign="{
                warehouseExportCkId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseExportCkId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="境内默认仓库" prop="warehouseDomesticName">
            <business-autocomplete-warehouse
              v-model="form.warehouseDomesticName"
              value-key="warehouseName"
              label="境内默认仓库"
              placeholder="请输入境内默认仓库"
              :auto-assign="{
                warehouseDomesticId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseDomesticId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="境外默认仓库" prop="warehouseOutsideName">
            <business-autocomplete-warehouse
              v-model="form.warehouseOutsideName"
              value-key="warehouseName"
              label="境外默认仓库"
              placeholder="请输入境外默认仓库"
              :auto-assign="{
                warehouseOutsideId: 'id'
              }"
              :form="form"
              @clear="() => (form.warehouseOutsideId = 0)"
            ></business-autocomplete-warehouse>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
