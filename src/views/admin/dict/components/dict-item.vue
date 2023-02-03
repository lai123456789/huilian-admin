<script>
import { getDictItem, deleteDictItemById } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormItem from './enter-form-item'
import { mapGetters } from 'vuex'

export default {
  name: 'DictItem',
  components: { EnterFormItem },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableRow: Object
  },
  data() {
    return {
      constant,
      visible: this.value,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getDictItem({ ...pager, ...transforArrayPayload(Object.assign({ dictId: this.tableRow.id }, params)) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'type', title: '类型' },
        { field: 'value', title: '数据值' },
        { field: 'label', title: '标签名' },
        { field: 'description', title: '描述' },
        { field: 'sort', title: '排序' },
        { field: 'remarks', title: '备注信息' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
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
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_ITEM_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_ITEM_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_ITEM_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteDictItemById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['dictItemRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['dictItemRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="dict-item-dialog" :show-footer="false" width="1000px" title="字典项管理">
    <!-- 列表页 -->
    <base-page
      ref="dictItemRef"
      :name="constant.TABLE_NAME_SYS_DICT_ITEM"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
    />
    <enter-form-item
      v-model="enterForm.visible"
      :type="enterForm.type"
      :table-row="Object.assign({ dictId: tableRow.id, type: tableRow.type }, mainRow)"
      :re-load="reLoad"
    />
  </base-dialog>
</template>

<style lang="scss">
.dict-item-dialog {
  .base-dialog-body {
    padding: 0;
    height: 70vh;
  }
}
</style>
