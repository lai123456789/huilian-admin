<script>
import constant from '@/constant'
import { remove } from 'xe-utils'

export default {
  name: 'Grid',
  props: {
    keyField: {
      type: String,
      default: '__XID'
    },
    height: {
      type: [Number, String],
      default: '300px'
    },
    showSeq: {
      type: Boolean,
      default: true
    },
    seqName: {
      type: String,
      default: '序号'
    }
  },
  data() {
    return {
      constant,
      // 选中的数据
      selectRows: [],
      // 当前高亮行
      currentRow: {}
      // orient: {
      //   visible: false,
      //   mask: false,
      //   options: [],
      //   rules: {},
      //   form: {
      //     columnName: '',
      //     content: ''
      //   }
      // }
    }
  },
  methods: {
    loadColumns(columns) {
      this.getVxeGridInstance().loadColumns(columns)
    },
    loadData(data = {}, mode = 'insert') {
      this.getVxeGridInstance().loadData(data, mode)
    },
    handleCellClick({ row, column }) {
      // 除了有复选框的列，其他列可以通过行点击选中的当前这一条数据
      if (column.type !== 'checkbox') {
        this.$nextTick(() => {
          this.getVxeGridInstance().setCheckboxRow([row], true)
        })
      }
    },
    handleCheckboxAll(selectRows, { checked }) {
      if (checked) {
        this.selectRows = selectRows
      } else {
        this.selectRows = []
      }
      this.clearCurrentRow()
    },
    handleCheckboxChange(_, { checked, row }) {
      if (checked) {
        this.selectRows.push(row)
        // 选中当前行并且高亮
        this.getVxeGridInstance().setCurrentRow(row)
        this.currentRow = row
        this.$emit('current-change', this.getCurrentRecord())
      } else {
        remove(this.selectRows, item => item[this.keyField] === row[this.keyField])
        if (this.currentRow[this.keyField] === row[this.keyField]) {
          this.clearCurrentRow()
        }
      }
    },
    handleCurrentChange({ row }) {
      this.currentRow = row
      this.$emit('current-change', this.getCurrentRecord())
    },
    clearCurrentRow() {
      this.getVxeGridInstance().clearCurrentRow()
      this.$emit('current-clear')
    },
    getCurrentRecord() {
      return this.getVxeGridInstance().getCurrentRecord()
    },
    handleDelete(cb) {
      this.selectRows = []
      this.getVxeGridInstance().handleDelete(cb)
    },
    // handleOrient() {
    //   this.orient.visible = true
    // },
    // handleClearOrient() {
    //   this.orient.mask = false
    //   this.orient.form = { columnName: this.orient.options.length > 0 ? this.orient.options[0].value : '', content: '' }
    // },
    // handleOrientSave() {},
    getVxeGridInstance() {
      return this.$refs.editTableRef
    }
  }
}
</script>

<template>
  <!-- 为了兼容单一窗口的表格 -->
  <div class="grid">
    <base-edit-table
      ref="editTableRef"
      is-current
      :disabled="false"
      :edit-config="{
        enabled: false
      }"
      :height="height"
      :key-field="keyField"
      :show-seq="showSeq"
      :seq-name="seqName"
      :show-added="false"
      :show-delete="false"
      :name="constant.TABLE_NAME_CUSTOMS_DECLARATION_DETAILS"
      @cell-click="handleCellClick"
      @checkboxAll="handleCheckboxAll"
      @checkboxChange="handleCheckboxChange"
      @current-change="handleCurrentChange"
    >
      <template v-slot:buttons="{ selectRecords }">
        <slot name="buttons" :selectRecords="selectRecords"></slot>
      </template>
      <template v-slot:suffixButtons="{ selectRecords }">
        <slot name="suffixButtons" :selectRecords="selectRecords"></slot>
        <!-- <el-button size="mini" type="primary" @click="handleOrient">定位</el-button>
        <el-button size="mini" type="primary" @click="handleClearOrient">清空定位</el-button> -->
      </template>
    </base-edit-table>

    <!-- 定位弹窗 -->
    <!-- <base-dialog :visible.sync="orient.visible" title="定位" width="400px" @onSave="handleOrientSave">
      <base-form ref="formRef" :model="orient.form" :rules="orient.rules" label-suffix=":" label-width="60px" size="mini">
        <base-row>
          <base-col :span="24">
            <base-form-item label="列名" prop="columnName">
              <base-select v-model="orient.form.columnName" clearable placeholder="请选择" :options="orient.options"></base-select>
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="内容" prop="content">
              <base-input v-model="orient.form.content" placeholder="请输入内容" />
            </base-form-item>
          </base-col>
        </base-row>
      </base-form>
    </base-dialog> -->
  </div>
</template>

<style lang="scss" scoped>
.grid {
  ::v-deep .vxe-grid {
    .vxe-body--column,
    .vxe-header--column {
      height: 30px;
    }
  }
}
</style>
