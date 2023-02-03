<!-- 供应商交货信息 -->
<script>
import { getCompanySupDelivery, deleteCompanySupDeliveryById } from '@/api/company/company-sup-delivery'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormDelivery from './components/enter-form-delivery'
import { mapGetters } from 'vuex'

export default {
  name: 'Delivery',
  components: { EnterFormDelivery },
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
        const { data } = await getCompanySupDelivery({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                supplierId: this.tableRow.id
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
        { field: 'deliveryCompany', title: '交货公司' },
        { field: 'deliveryAddress', title: '提货地址' },
        {
          field: 'defaultFlag',
          title: '是否默认',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'person', title: '联系人' },
        { field: 'mobile', title: '联系电话' },
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
        visible: this.permissions[constant.PERMISSION_SUP_TABS_DELIVERY_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SUP_TABS_DELIVERY_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SUP_TABS_DELIVERY_DEL],
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
          deleteCompanySupDeliveryById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['deliveryRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['deliveryRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="delivery">
    <!-- 列表页 -->
    <base-page
      ref="deliveryRef"
      :name="constant.TABLE_NAME_SUPPLIER_DELIVERY"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-delivery
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
