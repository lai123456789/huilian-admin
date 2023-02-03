<!-- 委托客戶->B2B用户 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import EnterFormCusUser from './components/enter-form-cus-user'
import { getDataDictionary } from '@/api/admin/dicts'
import { deleteCusUserById, getCusUser } from '@/api/admin/cus-user'

export default {
  name: 'CusUser',
  components: { EnterFormCusUser },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
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
        const { data } = await getCusUser({
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
        { field: 'realname', title: '姓名', searchProps: true },
        { field: 'username', title: '用户名' },
        {
          field: 'sex',
          title: '性别',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SEX)
            }
          }
        },
        { field: 'phone', title: '手机号' },
        {
          field: 'lockFlag',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_LOCK_FLAG)
            }
          }
        },
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
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_USER_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_USER_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_CUS_USER_DEL],
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
          deleteCusUserById(row.userId).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusUserRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['cusUserRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cus-user">
    <!-- 列表页 -->
    <base-page
      ref="cusUserRef"
      key-field="userId"
      :name="constant.TABLE_NAME_CUSTOMER_ONLINE"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-cus-user v-model="enterForm.visible" :type="enterForm.type" :main-row="mainRow" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
