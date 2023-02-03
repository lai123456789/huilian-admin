<script>
import { getSysJobById, saveSysJob, updateSysJob } from '@/api/admin/job'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'
import BaseCron from '@/components/base/cron'

const form = {
  jobName: '',
  jobGroup: '',
  jobType: '',
  executePath: '',
  className: '',
  methodName: '',
  methodParamsValue: '',
  cronExpression: '',
  misfirePolicy: '',
  remark: ''
}

export default {
  name: 'EnterForm',
  components: { BaseCron },
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
        jobName: [{ required: true, message: '任务名称必填' }],
        jobGroup: [{ required: true, message: '任务组名必填' }],
        jobType: [{ required: true, message: '类型必填' }],
        cronExpression: [{ required: true, message: 'cron表达式必填' }],
        misfirePolicy: [{ required: true, message: '错失执行策略必填' }]
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
        const { DICTS_JOB_TYPE, DICTS_MISFIRE_POLICY } = constant
        Promise.all([
          getDataDictionary([DICTS_JOB_TYPE, DICTS_MISFIRE_POLICY]),
          this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getSysJobById(this.tableRow.jobId)
        ]).then(([dicts, info]) => {
          this.dicts = dicts
          if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
            Object.assign(this.form, info.data)
          }
        })
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
            saveSysJob(this.form)
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
            updateSysJob(this.form)
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
    width="800px"
    :title="
      type === enums.FORM_TYPE.getFieldByKey('ADDED')
        ? enums.FORM_TYPE.getFieldByKey('ADDED', 'label')
        : enums.FORM_TYPE.getFieldByKey('MODIFY', 'label')
    "
    @save="handleSave"
  >
    <base-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
      <base-row :gutter="10">
        <base-col :span="12">
          <base-form-item label="任务名称" prop="jobName">
            <base-input v-model="form.jobName" placeholder="请输入任务名称" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="任务组名" prop="jobGroup">
            <base-input v-model="form.jobGroup" placeholder="请输入任务组名" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="类型" prop="jobType">
            <base-select v-model="form.jobType" placeholder="请选择类型" :options="dicts[constant.DICTS_JOB_TYPE]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="执行路径" prop="executePath">
            <base-input v-model="form.executePath" placeholder="请输入执行路径" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="执行文件" prop="className">
            <base-input v-model="form.className" placeholder="请输入执行文件" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="执行方法" prop="methodName">
            <base-input v-model="form.methodName" placeholder="请输入执行方法" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="执行参数值" prop="methodParamsValue">
            <base-input v-model="form.methodParamsValue" placeholder="请输入执行参数值" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="cron表达式" prop="cronExpression">
            <base-cron v-model="form.cronExpression"></base-cron>
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="错失执行策略" prop="misfirePolicy">
            <base-select v-model="form.misfirePolicy" placeholder="请选择错失执行策略" :options="dicts[constant.DICTS_MISFIRE_POLICY]" />
          </base-form-item>
        </base-col>

        <base-col :span="12">
          <base-form-item label="备注信息" prop="remark">
            <base-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
