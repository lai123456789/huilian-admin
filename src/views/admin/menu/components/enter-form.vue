<script>
import { getMenuById, saveMenu, updateMenu } from '@/api/admin/menu'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  parentId: void 0,
  path: '',
  type: enums.MENU_TYPE.getFieldByKey('MENU'),
  name: '',
  url: '',
  permission: '',
  openMode: enums.OPEN_MODE.getFieldByKey('INTERNAL'),
  sort: 1,
  icon: ''
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
        name: [{ required: true, message: '名称必填', trigger: 'blur' }],
        sort: [{ required: true, message: '顺序必填', trigger: 'blur' }]
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
        Promise.all([getDataDictionary([]), this.type === enums.FORM_TYPE.getFieldByKey('MODIFY') && getMenuById(this.tableRow.id)]).then(
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
        this.treeSelectData = [{ id: '-1', name: '根菜单', children: data }]
      }
    },
    handleTypeChange() {
      this.form.icon = ''
      this.form.path = ''
    },
    handleSave(done) {
      this.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          if (this.type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
            saveMenu(this.form)
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
            updateMenu(this.form)
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
    <base-form ref="formRef" :model="form" :rules="rules" label-width="110px" size="mini">
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
          <base-form-item label="类型" prop="type">
            <base-radio v-model="form.type" is-group :options="enums.MENU_TYPE.getList()" @change="handleTypeChange" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item :label="`${enums.MENU_TYPE.getFieldByValue(form.type)}名称`" prop="name">
            <base-input v-model="form.name" :placeholder="`请输入${enums.MENU_TYPE.getFieldByValue(form.type)}名称`" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="权限标识" prop="permission">
            <base-input v-model="form.permission" placeholder="请输入权限标识" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.type !== enums.MENU_TYPE.getFieldByKey('TABS')" :span="24">
          <base-form-item label="菜单路径" prop="url">
            <base-input v-model="form.url" placeholder="请输入菜单路径" />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="组件路径" prop="path">
            <base-input v-model="form.path" placeholder="请输入组件路径" />
          </base-form-item>
        </base-col>

        <base-col v-if="form.type !== enums.MENU_TYPE.getFieldByKey('MENU')" :span="24">
          <base-form-item label="打开方式" prop="openMode">
            <base-switch
              v-model="form.openMode"
              inline
              active-text="外部"
              inactive-text="内部"
              :width="55"
              :active-value="enums.OPEN_MODE.getFieldByKey('EXTERNAL')"
              :inactive-value="enums.OPEN_MODE.getFieldByKey('INTERNAL')"
            />
          </base-form-item>
        </base-col>

        <base-col :span="24">
          <base-form-item label="排序" prop="sort">
            <base-input-number v-model="form.sort" controls align="center" />
          </base-form-item>
        </base-col>
      </base-row>
    </base-form>
  </base-dialog>
</template>
