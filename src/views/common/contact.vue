<!-- 联系人资料 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormContact from './components/enter-form-contact'
import { mapGetters } from 'vuex'
import { deleteCompanyPersonById, getCompanyPerson } from '@/api/company/company-person'

export default {
  name: 'Contact',
  components: { EnterFormContact },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    permissionsContact: Object
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCompanyPerson({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customerId: this.tableRow.id,
                companyId: this.tableRow.companyId
              },
              params
            )
          )
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'name', title: '联系人姓名' },
        { field: 'mobile', title: '联系人电话' },
        { field: 'email', title: '联系人邮箱' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[this.permissionsContact.add],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[this.permissionsContact.edit],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[this.permissionsContact.del],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded(row) {
      this.mainRow = row
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
          deleteCompanyPersonById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['contactRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['contactRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="contact">
    <!-- 列表页 -->
    <base-page
      ref="contactRef"
      :name="constant.TABLE_NAME_CUSTOMER_PERSON"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-contact v-model="enterForm.visible" :type="enterForm.type" :main-row="mainRow" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
