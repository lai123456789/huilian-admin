<script>
import { getDeptById, saveDept, updateDept } from '@/api/admin/dept'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  parentId: void 0,
  isLock: enums.WHETHER_BOOLEAN_STATUS.getFieldByKey('YES'),
  name: '',
  sort: 1
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
    parentId: String,
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
        name: [{ required: true, message: '部门名称不能为空' }]
      },
      dicts: {},
      treeSelectData: []
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        this.form = clone(form, true)
        Promise.all([getDataDictionary([]), this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getDeptById(this.tableRow.id)]).then(
          ([dicts, info]) => {
            this.dicts = dicts
            if (this.type === enums.FORM_TYPE.getFieldByKey('MODIFY')) {
              Object.assign(this.form, info.data)
            } else {
              this.form.parentId = this.parentId
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
    getTreeSelectRecords(data = []) {
      if (!this.treeSelectData.length) {
        const roots = [{ id: '0', name: '根菜单', children: [] }]
        roots[0].children = data
        this.treeSelectData = roots
      }
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveDept(this.form)
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
            updateDept(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="mini">
      <base-row>
        <base-col :span="24">
          <base-form-item label="父级" prop="parentId">
            <base-tree-select
              v-model="form.parentId"
              check-strictly
              :props="{
                value: 'id',
                label: 'name'
              }"
              :data="treeSelectData"
              placeholder="请选择父级"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="部门名称" prop="name">
            <base-input v-model="form.name" placeholder="请输入部门名称" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="排序" prop="sort">
            <base-input-number v-model="form.sort" controls align="center" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="有无权限" prop="isLock">
            <base-radio v-model="form.isLock" is-group :options="enums.WHETHER_BOOLEAN_STATUS.getList()" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
