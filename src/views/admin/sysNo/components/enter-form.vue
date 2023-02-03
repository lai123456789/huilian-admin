<script>
import { getSysNoById, saveSysNo, updateSysNo } from '@/api/admin/sys-no'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  seqName: '',
  seqPrefix: '',
  seqDescribe: '',
  seqLength: '4',
  seqDateFormat: 'yyyyMMdd',
  status: enums.ENABLE_DISABLE.getFieldByKey('ENABLED')
}

export default {
  name: 'EnterForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: enums.FORM_TYPE.getFieldByKey('ADDED')
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
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
      rules: {
        seqName: [{ required: true, message: '编码名称必填', trigger: 'blur' }],
        seqPrefix: [{ required: true, message: '编码前缀必填', trigger: 'blur' }],
        seqLength: [{ required: true, message: '补位长度必填', trigger: 'blur' }],
        seqDateFormat: [{ required: true, message: '日期格式必填', trigger: 'blur' }]
      },
      dicts: {}
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        Promise.all([getDataDictionary([]), this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getSysNoById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            this.dicts = dicts
            if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
              Object.assign(this.form, info.data)
            }
          }
        )
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveSysNo(this.form)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('ADDED', 'label')}成功`)
                this.visible = false
                done()
                this.reLoad(false)
              })
              .catch(() => {
                done()
              })
          } else {
            updateSysNo(this.form)
              .then(() => {
                this.$message.success(`${enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')}成功`)
                this.visible = false
                done()
                // 刷新表格的时候，保存之前选中的数据
                this.reLoad(true)
              })
              .catch(() => {
                done()
              })
          }
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
  <base-dialog
    :visible.sync="visible"
    width="500px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="编码名称" prop="seqName">
            <base-input v-model="form.seqName" placeholder="请输入编码名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="编码前缀" prop="seqPrefix">
            <base-input v-model="form.seqPrefix" placeholder="请输入编码前缀" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="编码描述" prop="seqDescribe">
            <base-input v-model="form.seqDescribe" placeholder="请输入编码描述" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="补位长度" prop="seqLength">
            <base-input v-model="form.seqLength" placeholder="请输入补位长度" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="日期格式" prop="seqDateFormat">
            <base-input v-model="form.seqDateFormat" placeholder="请输入日期格式" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="状态" prop="status">
            <base-radio v-model="form.status" is-group :options="enums.ENABLE_DISABLE.getList()"></base-radio>
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
