<script>
import enums from '@/enums'
import constant from '@/constant'
import EnterFormParts from './enter-form-parts'

export default {
  name: 'Parts',
  components: { EnterFormParts },
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    mainRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      constant,
      visible: this.value,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      tableData: [],
      request: null,
      showPage: false,
      columns: [
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号' },
        { field: 'productBrand', title: '品牌' },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        { field: 'qty', title: '数量' },
        {
          field: 'netWeight',
          title: '净重 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'grossWeight',
          title: '毛重 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'packages',
          title: '件数 ',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        { field: 'remark', title: '备注' }
      ],
      buttonsConfig: {},
      keyField: '__XID'
    }
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
      if (newValue) {
        const { orderImportDetailPartDTOList, orderImportDetailPartVOList } = this.mainRow
        this.tableData = orderImportDetailPartDTOList || orderImportDetailPartVOList || []
        this.buttonsConfig = {
          add: {
            visible: !this.disabled,
            handler: this.handleAdded
          },
          edit: {
            visible: !this.disabled,
            handler: this.handleEdit
          },
          del: {
            visible: !this.disabled,
            handler: this.handleDel
          }
        }
        this.request = () => {
          return Promise.resolve({
            data: this.tableData,
            total: this.tableData.total
          })
        }
        this.showPage = true
      } else {
        this.showPage = false
        this.tableData = []
      }
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          const index = this.tableData.findIndex(v => row.id === v.id)
          if (index > -1) {
            this.tableData.splice(index, 1)
            // 清空表格全部选中的数据
            this.$refs['partsRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          }
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['partsRef'].refresh(isClearSelect)
    },
    handleTableData(row, type) {
      if (type === enums.FORM_TYPE.getFieldByKey('ADDED')) {
        this.tableData.unshift(row)
        this.reLoad(false)
      } else {
        const index = this.tableData.findIndex(v => v[this.keyField] === row[this.keyField])
        this.$set(this.tableData, index, row)
        this.reLoad(false)
      }
    },
    handleSave(done) {
      this.$emit('save', this.mainRow, this.tableData, done)
    }
  }
}
</script>

<template>
  <base-dialog custom-class="parts-dialog" :visible.sync="visible" width="80%" title="配件列表" :show-save="!disabled" @save="handleSave">
    <div class="parts">
      <base-page
        v-if="showPage"
        ref="partsRef"
        :name="constant.TABLE_NAME_EXPORT_ORDER_PARTS"
        :show-pager="false"
        :key-field="keyField"
        :tools-config="{
          setting: {
            visible: false
          },
          download: {
            visible: false
          }
        }"
        show-footer
        :columns="columns"
        :request="request"
        :buttons-config="buttonsConfig"
      />
    </div>
    <enter-form-parts
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="tableRow"
      :handle-table-data="handleTableData"
      :re-load="reLoad"
    />
  </base-dialog>
</template>

<style lang="scss">
.parts-dialog {
  .base-dialog-body {
    padding: 0;
  }
  .parts {
    height: 60vh;
  }
}
</style>
