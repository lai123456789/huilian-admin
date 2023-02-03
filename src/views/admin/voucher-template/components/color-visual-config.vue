<script>
export default {
  name: 'ColorVisualConfig',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: String,
    tableRow: {
      type: Object,
      default: () => null
    },
    predefineColors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    this.editConfig = { trigger: 'click', mode: 'row' }
    this.editRules = {
      value: [{ required: true, message: 'key值必填' }],
      colorValue: [{ required: true, message: '颜色值必填' }]
    }
    return {
      show: false,
      tableConfig: {
        maxHeight: '400px',
        border: true,
        autoResize: true,
        resizable: true,
        align: 'center',
        size: 'mini',
        columns: [
          { type: 'seq', width: 50 },
          { type: 'checkbox', width: 50 },
          {
            field: 'value',
            title: 'key值',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row, column }) => {
                return [<el-input vModel={row['value']} size="mini" clearable placeholder={`请输入${column.title}`} />]
              },
              default: ({ row }) => {
                return [<span>{row['value']}</span>]
              }
            }
          },
          {
            field: 'colorValue',
            title: '颜色值',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row }) => {
                return [<el-color-picker vModel={row['colorValue']} size="mini" show-alpha predefine={this.predefineColors} />]
              },
              default: ({ row }) => {
                return [
                  <div
                    style={{
                      width: '13px',
                      height: '13px',
                      textAlign: 'center',
                      display: 'inline-block',
                      backgroundColor: row['colorValue']
                    }}
                  >
                    {' '}
                  </div>
                ]
              }
            }
          },
          {
            field: 'desc',
            title: '描述',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row, column }) => {
                return [<el-input vModel={row['desc']} size="mini" clearable placeholder={`请输入${column.title}`} />]
              },
              default: ({ row }) => {
                return [<span>{row['desc']}</span>]
              }
            }
          }
        ],
        editConfig: this.editConfig,
        editRules: this.editRules
      },
      selectRecords: []
    }
  },
  computed: {
    keepSource() {
      /* 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等（开启后影响性能，具体取决于数据量） */
      /* https://xuliangzhan_admin.gitee.io/vxe-table/v2/#/grid/api */
      return true
    }
  },
  watch: {
    async visible(val) {
      if (val) {
        const { color_value } = this.tableRow
        if (color_value) {
          const arr = []
          for (const key in color_value) {
            if (Object.hasOwnProperty.call(color_value, key)) {
              arr.push({
                value: key,
                colorValue: color_value[key][0],
                desc: color_value[key][1]
              })
            }
          }
          this.$nextTick(() => {
            this.selectRecords = []
            this.$refs.vxeGridRef.remove()
            this.insertEvent(arr)
          })
        }
      }
      this.show = val
    },
    show(val) {
      this.$emit('update:visible', val)
    },
    type(newValue) {
      this.tableConfig.editConfig = newValue === 'edit' ? this.editConfig : {}
      this.tableConfig.editRules = newValue === 'edit' ? this.editRules : {}
    }
  },
  methods: {
    handleAdd() {
      this.insertEvent({
        value: '',
        colorValue: '',
        desc: ''
      })
    },
    insertEvent(rows, place = -1) {
      this.$refs.vxeGridRef.insertAt(rows, place)
    },
    /* 单个复选框 */
    handleCheckboxChange() {
      this.selectRecords = this.$refs.vxeGridRef.getCheckboxRecords()
    },
    /* 全选 */
    handleCheckboxAll() {
      this.selectRecords = this.$refs.vxeGridRef.getCheckboxRecords()
    },
    /* 删除操作 */
    handleDelete() {
      /* 删除选中行的数据 */
      this.$messageConfirm({ content: '是否确认删除所选记录?' }, () => {
        this.$refs.vxeGridRef.removeCheckboxRow()
        this.selectRecords = []
      })
    },
    /* 上排序方法 */
    async handleUpClick() {
      const checkboxRecord = this.$refs.vxeGridRef.getCheckboxRecords()[0]
      const records = this.getInsertRecords()
      const currentIndex = records.findIndex(record => record['_XID'] === checkboxRecord['_XID'])
      if (currentIndex === 0) return this.$message.warning('当前为第一行，无法上移')
      const currentPrevRow = this.getInsertRecords().splice(currentIndex - 1, 1)[0]
      await this.$refs.vxeGridRef.remove(checkboxRecord)
      await this.insertEvent(checkboxRecord, currentPrevRow)
      this.$nextTick(() => {
        this.$refs.vxeGridRef.setCheckboxRow(this.getInsertRecords()[currentIndex - 1], true)
      })
    },
    /* 下排序方法 */
    async handleDownClick() {
      const checkboxRecord = this.$refs.vxeGridRef.getCheckboxRecords()[0]
      const records = this.getInsertRecords()
      const currentIndex = records.findIndex(record => record['_XID'] === checkboxRecord['_XID'])
      if (currentIndex === records.length - 1) return this.$message.warning('当前为最后一行，无法下移')
      const currentNextRow = this.getInsertRecords().splice(currentIndex + 1, 1)[0]
      await this.$refs.vxeGridRef.remove(currentNextRow)
      await this.insertEvent(currentNextRow, checkboxRecord)
      this.$nextTick(() => {
        this.$refs.vxeGridRef.setCheckboxRow(this.getInsertRecords()[currentIndex + 1], true)
      })
    },
    /* 获取插入的表格数据 */
    getInsertRecords() {
      const { insertRecords } = this.$refs.vxeGridRef.getRecordset()
      return insertRecords
    },
    handleSave(done) {
      this.$refs.vxeGridRef.validate(errMap => {
        if (errMap) {
          const { row, rule } = Object.values(errMap)[0]
          const index = this.$refs.vxeGridRef._getRowIndex(row)
          this.$message.error(`第${index + 1}行${rule.message}`)
          done()
        } else {
          const insertRecords = this.$refs.vxeGridRef.getInsertRecords()
          const colorValue = {}
          insertRecords.forEach(record => {
            colorValue[record.value] = [record.colorValue, record.desc]
          })
          this.tableRow.color_value = colorValue
          this.show = false
          done()
        }
      })
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="show" custom-class="color-visual-config-dialog" title="设置数据字典颜色值" width="700px" @save="handleSave">
    <vxe-grid
      ref="vxeGridRef"
      v-bind="tableConfig"
      :keep-source="keepSource"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxAll"
    >
      <template #toolbar>
        <div v-if="type === 'edit'" class="table-visual-config-toolbar">
          <el-button size="small" @click="handleAdd">新增</el-button>
          <el-button
            :disabled="!selectRecords.length || selectRecords.length > 1"
            class="grid-editor-button"
            size="mini"
            type="success"
            icon="el-icon-sort-up"
            @click="handleUpClick"
            >上移</el-button
          >
          <el-button
            :disabled="!selectRecords.length || selectRecords.length > 1"
            class="grid-editor-button"
            size="mini"
            type="success"
            icon="el-icon-sort-down"
            @click="handleDownClick"
            >下移</el-button
          >
          <el-button size="mini" icon="el-icon-delete" :disabled="!selectRecords.length" type="danger" @click="handleDelete"
            >删除</el-button
          >
        </div>
      </template>
    </vxe-grid>
  </base-dialog>
</template>

<style lang="scss">
.color-visual-config-dialog {
  .table-visual-config-toolbar {
    margin-bottom: 10px;
  }
  .el-color-picker {
    padding-top: 5px;
    box-sizing: border-box;
  }
  .vxe-table {
    .vxe-cell {
      .vxe-edit-icon {
        display: none;
      }
    }
    .vxe-cell--valid {
      display: none;
    }
  }
}
</style>
