<!-- 字典管理 -->
<script>
import { getDict, deleteDictById, syncDict } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import EnterForm from './components/enter-form'
import DictItem from './components/dict-item'
import { mapGetters } from 'vuex'

export default {
  name: 'Dict',
  components: { EnterForm, DictItem },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      item: {
        visible: false,
        row: {}
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getDict({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'type', title: '类型', searchProps: true },
        { field: 'description', title: '描述', searchProps: true },
        {
          field: 'system',
          title: '字典类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DICT_TYPEE)
            }
          },
          searchProps: { type: 'select' }
        },
        { field: 'remarks', title: '备注信息' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_SYS_DICT],
      mark: constant.PERMISSION_SYS_DICT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_DICT_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '同步缓存',
          visible: this.permissions[constant.PERMISSION_SYS_DICT_SYNC],
          noNeedRows: true,
          handler: this.handleSync
        }
      ]
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteDictById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['dictRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    handleSync() {
      syncDict().then(() => {
        this.$message.success('同步成功')
      })
    },
    openDetails({ row }) {
      this.item = {
        visible: true,
        row: row
      }
    },
    reLoad(isClearSelect) {
      this.$refs['dictRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="dict">
    <!-- 列表页 -->
    <base-page
      ref="dictRef"
      :name="constant.TABLE_NAME_SYS_DICT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
      @cell-dblclick="openDetails"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
    <dict-item v-model="item.visible" :table-row="item.row"></dict-item>
  </div>
</template>
