<script>
import ColorVisualConfig from './color-visual-config'
import { isEmpty } from 'xe-utils'
import variables from '@/styles/variables.scss'

export default {
  name: 'TableVisualConfig',
  components: { ColorVisualConfig },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: String
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
        height: 'auto',
        autoResize: true,
        border: true,
        resizable: true,
        align: 'center',
        size: 'mini',
        columns: [
          { type: 'seq', width: 50 },
          { type: 'checkbox', width: 50 },
          {
            field: 'field',
            title: '字段名',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row, column }) => {
                return [<el-input vModel={row['field']} size="mini" clearable placeholder={`请输入${column.title}`} />]
              },
              default: ({ row }) => {
                return [<span>{row['field']}</span>]
              }
            }
          },
          {
            field: 'title',
            title: '列名',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row, column }) => {
                return [<el-input vModel={row['title']} size="mini" clearable placeholder={`请输入${column.title}`} />]
              },
              default: ({ row }) => {
                return [<span>{row['title']}</span>]
              }
            }
          },
          {
            field: 'align',
            title: '对齐方式',
            editRender: { name: 'input' },
            slots: {
              edit: ({ row, column }) => {
                return [
                  <el-select vModel={row['align']} size="mini" clearable placeholder={`请选择${column.title}`}>
                    {this.alignOptions.map(option => {
                      return <el-option key={option.value} label={option.label} value={option.value} />
                    })}
                  </el-select>
                ]
              },
              default: ({ row }) => {
                return [<span>{this.formatOptions(row['align'], this.alignOptions) || row['align']}</span>]
              }
            }
          },
          {
            field: 'searchProps',
            title: '搜索项配置',
            children: [
              {
                field: 'searchProps_type',
                title: '类型',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row, column }) => {
                    return [
                      <el-select vModel={row['searchProps_type']} size="mini" clearable placeholder={`请选择${column.title}`}>
                        {this.searchPropsTypeOptions.map(option => {
                          return <el-option key={option.value} label={option.label} value={option.value} />
                        })}
                      </el-select>
                    ]
                  },
                  default: ({ row }) => {
                    return [
                      <span>{this.formatOptions(row['searchProps_type'], this.searchPropsTypeOptions) || row['searchProps_type']}</span>
                    ]
                  }
                }
              },
              {
                field: 'searchProps_sort',
                title: '排序',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row }) => {
                    return [<base-input-number vModel={row['searchProps_sort']} size="mini" />]
                  },
                  default: ({ row }) => {
                    return [<span>{row['searchProps_sort']}</span>]
                  }
                }
              },
              {
                field: 'searchProps_lableWidth',
                title: '表单域标签宽度',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row, column }) => {
                    return [<el-input vModel={row['searchProps_lableWidth']} size="mini" clearable placeholder={`请输入${column.title}`} />]
                  },
                  default: ({ row }) => {
                    return [<span>{row['searchProps_lableWidth']}</span>]
                  }
                }
              }
            ]
          },
          {
            field: 'formatter',
            title: '格式化配置',
            children: [
              {
                field: 'formatter_type',
                title: '类型',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row, column }) => {
                    return [
                      <el-select
                        vModel={row['formatter_type']}
                        size="mini"
                        clearable
                        placeholder={`请选择${column.title}`}
                        onChange={() => this.handleFormatterTypeChange(row)}
                      >
                        {this.formatterTypeOptions.map(option => {
                          return <el-option key={option.value} label={option.label} value={option.value} />
                        })}
                      </el-select>
                    ]
                  },
                  default: ({ row }) => {
                    return [<span>{this.formatOptions(row['formatter_type'], this.formatterTypeOptions) || row['formatter_type']}</span>]
                  }
                }
              },
              {
                field: 'formatter_mode',
                title: '格式化函数',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row }) => {
                    return [
                      row['formatter_type'] === 'options' ? (
                        <el-input vModel={row['formatter_mode']} placeholder="请输入字典类型" size="mini" />
                      ) : row['formatter_type'] === 'number' ? (
                        <el-select vModel={row['formatter_mode']} clearable size="mini" clearable placeholder="请输入格式化函数">
                          {this.formatterTypeNumberOptions.map(option => {
                            return <el-option key={option.value} label={option.label} value={option.value} />
                          })}
                        </el-select>
                      ) : row['formatter_type'] === 'date' ? (
                        <el-select vModel={row['formatter_mode']} clearable size="mini" clearable placeholder="请输入格式化函数">
                          {this.formatterTypeDateOptions.map(option => {
                            return <el-option key={option.value} label={option.label} value={option.value} />
                          })}
                        </el-select>
                      ) : (
                        <span>{row['formatter_mode']}</span>
                      )
                    ]
                  },
                  default: ({ row }) => {
                    return [
                      row['formatter_type'] === 'number' ? (
                        this.formatOptions(row['formatter_mode'], this.formatterTypeNumberOptions) || row['formatter_mode']
                      ) : row['formatter_type'] === 'date' ? (
                        this.formatOptions(row['formatter_mode'], this.formatterTypeDateOptions) || row['formatter_mode']
                      ) : (
                        <span>{row['formatter_mode']}</span>
                      )
                    ]
                  }
                }
              }
            ]
          },
          {
            field: 'color',
            title: '颜色配置',
            children: [
              {
                field: 'color_type',
                title: '类型',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row, column }) => {
                    return [
                      <el-select
                        vModel={row['color_type']}
                        size="mini"
                        clearable
                        placeholder={`请选择${column.title}`}
                        onChange={() => this.handleColorTypeChange(row)}
                      >
                        {this.colorTypeOptions.map(option => {
                          return <el-option key={option.value} label={option.label} value={option.value} />
                        })}
                      </el-select>
                    ]
                  },
                  default: ({ row }) => {
                    return [<span>{this.formatOptions(row['color_type'], this.colorTypeOptions) || row['color_type']}</span>]
                  }
                }
              },
              {
                field: 'color_value',
                title: '值',
                editRender: { name: 'input' },
                slots: {
                  edit: ({ row }) => {
                    return [
                      row['color_type'] === 'options' ? (
                        <el-button size="mini" onClick={() => this.handleColorEdit(row)}>
                          编辑
                        </el-button>
                      ) : row['color_type'] === 'text' ? (
                        <el-color-picker vModel={row['color_value']} size="mini" show-alpha predefine={this.predefineColors} />
                      ) : (
                        ''
                      )
                    ]
                  },
                  default: ({ row }) => {
                    return [
                      row['color_type'] === 'text' ? (
                        <div
                          style={{
                            width: '13px',
                            height: '13px',
                            textAlign: 'center',
                            display: 'inline-block',
                            backgroundColor: row['color_value']
                          }}
                        >
                          {' '}
                        </div>
                      ) : row['color_type'] === 'options' ? (
                        <el-button size="mini" onClick={ev => this.handleColorViewer(ev, row)}>
                          查看
                        </el-button>
                      ) : (
                        ''
                      )
                    ]
                  }
                }
              }
            ]
          }
        ],
        editConfig: this.editConfig,
        editRules: this.editRules
      },
      alignOptions: [
        { label: '居左', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '居右', value: 'right' }
      ],
      searchPropsTypeOptions: [
        { label: '输入框', value: 'input' },
        { label: '选择器', value: 'select' },
        { label: '选择器(多选)', value: 'select_multiple' },
        { label: '日期选择器', value: 'date' },
        { label: '日期时间选择器', value: 'datetime' }
      ],
      formatterTypeOptions: [
        { label: '数据字典', value: 'options' },
        { label: '数字', value: 'number' },
        { label: '日期', value: 'date' },
        { label: '百分比', value: 'percent' }
      ],
      formatterTypeNumberOptions: [
        { label: '保留2位小数', value: 'digits:2' },
        { label: '保留6位小数', value: 'digits:6' }
      ],
      formatterTypeDateOptions: [
        { label: '年月日', value: 'YYYY-MM-DD' },
        { label: '年月日时分秒', value: 'YYYY-MM-DD HH:mm:ss' },
        { label: '年', value: 'YYYY' },
        { label: '月', value: 'MM' }
      ],
      colorTypeOptions: [
        { label: '数据字典', value: 'options' },
        { label: '文本', value: 'text' }
      ],
      predefineColors: [variables.baseBlue, variables.baseRed, variables.baseGreen, variables.baseYellow, variables.baseGray],
      colorVisualConfig: {
        visible: false,
        type: 'edit',
        row: {}
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
        field: '',
        title: '',
        align: '',
        searchProps_type: '',
        searchProps_sort: 0,
        searchProps_lableWidth: '',
        formatter_type: '',
        formatter_mode: ''
      })
    },
    insertEvent(rows, place = -1) {
      this.$nextTick(() => {
        this.$refs.vxeGridRef.insertAt(rows, place)
      })
    },
    parseJson(data) {
      const columns = data.columns || []
      this.$nextTick(() => {
        this.selectRecords = []
        this.$refs.vxeGridRef.remove()
        this.insertEvent(
          columns.map(v => {
            const { field, title, align, searchProps, formatter, color } = v
            const obj = { field, title }
            if (align) {
              obj.align = this.formatOptions(align, this.alignOptions) || ''
            }
            if (searchProps && this.formatOptions(searchProps.type, this.searchPropsTypeOptions)) {
              obj.searchProps_type = searchProps.type
              if (searchProps.attrs && searchProps.attrs.multiple) {
                obj.searchProps_type = 'select_multiple'
              }
              if (searchProps.sort) obj.searchProps_sort = searchProps.sort
              if (searchProps.lableWidth) obj.searchProps_lableWidth = `${parseInt(searchProps.lableWidth)}px`
            }
            if (formatter && this.formatOptions(formatter.type, this.formatterTypeOptions)) {
              obj.formatter_type = formatter.type
              if (formatter.config && !isEmpty(formatter.config)) {
                if (formatter.type === 'options' && formatter.config.typeName) {
                  obj.formatter_mode = formatter.config.typeName
                } else if (formatter.type === 'number' && formatter.config.digits) {
                  obj.formatter_mode = this.formatOptions(`digits:${formatter.config.digits}`, this.formatterTypeNumberOptions) || ''
                } else if (formatter.type === 'date' && formatter.config.digits) {
                  obj.formatter_mode = this.formatOptions(formatter.config.valueFomat, this.formatterTypeDateOptions) || ''
                }
              }
            }
            if (color) {
              obj.color_type = color.type
              obj.color_value = color.value
            }
            return obj
          })
        )
      })
    },
    generateJson() {
      const insertRecords = this.$refs.vxeGridRef.getInsertRecords()
      const arr = insertRecords.map(record => {
        const {
          field,
          title,
          align,
          searchProps_type,
          searchProps_sort,
          searchProps_lableWidth,
          formatter_type,
          formatter_mode,
          color_type,
          color_value
        } = record
        const obj = { field, title }
        if (align) obj.align = align
        if (searchProps_type) {
          obj.searchProps = { type: searchProps_type }
          if (searchProps_type === 'select_multiple') {
            obj.searchProps.attrs = {}
            obj.searchProps.type = 'select'
            obj.searchProps.attrs.multiple = true
          }
          if (searchProps_sort) {
            obj.searchProps.config.sort = searchProps_sort
          }
          if (searchProps_lableWidth) {
            obj.searchProps.config.lableWidth = `${parseInt(searchProps_lableWidth)}px`
          }
        }
        if (formatter_type) {
          obj.formatter = { type: formatter_type, config: {} }
          if (formatter_type === 'options') {
            if (formatter_mode) {
              obj.formatter.config.typeName = formatter_mode
            } else {
              delete obj.formatter
            }
          } else if (formatter_type === 'number' && formatter_mode) {
            obj.formatter.config.digits = Number(formatter_mode.split('digits')[1])
          } else if (formatter_type === 'date' && formatter_mode) {
            obj.formatter.config.valueFomat = formatter_mode
          }
        }

        if (color_type && color_value) {
          obj.color = { type: color_type, value: color_value }
        }
        return obj
      })
      return arr
    },
    handleFormatterTypeChange(row) {
      row['formatter_mode'] = ''
    },
    handleColorTypeChange(row) {
      row['color_value'] = ''
    },
    formatOptions(value, options = []) {
      const target = options.find(v => v.value === value)
      return target ? target.label : false
    },
    handleColorEdit(row) {
      this.colorVisualConfig.visible = true
      this.colorVisualConfig.type = 'edit'
      this.colorVisualConfig.row = row
    },
    handleColorViewer(ev, row) {
      ev.stopPropagation()
      this.colorVisualConfig.visible = true
      this.colorVisualConfig.type = 'viewer'
      this.colorVisualConfig.row = row
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
          this.$emit('save', { columns: this.generateJson() })
          this.show = false
          done()
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <base-dialog :visible.sync="show" custom-class="table-visual-config-dialog" title="设置元数据" fullscreen @save="handleSave">
      <div class="table-visual-config">
        <vxe-grid
          ref="vxeGridRef"
          v-bind="tableConfig"
          :keep-source="keepSource"
          @checkbox-change="handleCheckboxChange"
          @checkbox-all="handleCheckboxAll"
        >
          <template #toolbar>
            <div v-if="type === 'edit'" class="table-visual-config-toolbar">
              <el-button size="small" @click="insertEvent">新增</el-button>
              <el-button size="mini" icon="el-icon-delete" :disabled="!selectRecords.length" type="danger" @click="handleDelete"
                >删除</el-button
              >
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
            </div>
          </template>
        </vxe-grid>
      </div>
    </base-dialog>
    <ColorVisualConfig
      :visible.sync="colorVisualConfig.visible"
      :table-row="colorVisualConfig.row"
      :type="colorVisualConfig.type"
      :predefine-colors="predefineColors"
    ></ColorVisualConfig>
  </div>
</template>

<style lang="scss">
$prefix: table-visual-config;

.#{$prefix}-dialog {
  .#{$prefix} {
    height: 100%;
  }

  .#{$prefix}-toolbar {
    margin-bottom: 10px;
  }

  display: flex;
  flex-direction: column;
  .el-dialog__body {
    height: 0;
    flex: 1;
    .q-dialog-body {
      padding: 15px;
      height: 100%;
      box-sizing: border-box;
      max-height: none;
    }
  }
  .el-select {
    width: 100%;
  }
  .el-input-number {
    width: 100%;
  }
  .el-color-picker {
    padding-top: 5px;
    box-sizing: border-box;
  }
  .vxe-table {
    .vxe-cell--valid {
      display: none;
    }
  }
}
</style>
