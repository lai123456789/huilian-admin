<!-- 凭证模板 -->
<script>
import { getBaseVoucherTemplate, deleteBaseVoucherTemplateById } from '@/api/base/base-voucher-template'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterForm from './components/enter-form'

export default {
  name: 'VoucherTemplate',
  components: { EnterForm },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getBaseVoucherTemplate({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'status',
          title: '状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ENANLE_DISABLE)
            }
          }
        },
        { field: 'templateNo', title: '模板编号' },
        { field: 'templateName', title: '模板名称' },
        { field: 'companyName', title: '账套名称' },
        { field: 'companyNo', title: '账套编码' },
        { field: 'voucherWord', title: '凭证字' },
        { field: 'voucherDate', title: '凭证日期' },
        { field: 'datasource', title: '数据源', textMaxColumnWidth: 300 },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
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
      show: this.permissions[constant.PERMISSION_VOUCHER_TEMP],
      mark: constant.PERMISSION_VOUCHER_TEMP
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_VOUCHER_TEMP_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_VOUCHER_TEMP_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_VOUCHER_TEMP_DEL],
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseVoucherTemplateById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['voucherTemplateRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['voucherTemplateRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="voucher-template">
    <!-- 列表页 -->
    <base-page
      ref="voucherTemplateRef"
      :name="constant.TABLE_NAME_VOUCHER_TEMP"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
    <enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
