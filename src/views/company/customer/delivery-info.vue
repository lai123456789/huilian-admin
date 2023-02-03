<!-- 委托客戶收貨信息 -->
<script>
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import EnterFormDeliveryInfo from './components/enter-form-delivery-info'
import { mapGetters } from 'vuex'
import { deleteCompanyCusDeliveryById, getCompanyCusDelivery } from '@/api/company/company-cus-delivery'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'DeliveryInfo',
  components: { EnterFormDeliveryInfo },
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
        const { data } = await getCompanyCusDelivery({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                customerId: this.tableRow.id
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
        { field: 'deliveryCompany', title: '收货公司' },
        {
          field: 'addressType',
          title: '地址类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_ADDRESS_TYPE)
            }
          }
        },
        { field: 'deliveryAddress', title: '收货地址' },
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
        visible: this.permissions[constant.PERMISSION_CUS_TABS_DELIVERY_INFO_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_DELIVERY_INFO_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_TABS_DELIVERY_INFO_DEL],
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
          deleteCompanyCusDeliveryById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['deliveryInfoRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['deliveryInfoRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="delivery-info">
    <!-- 列表页 -->
    <base-page
      ref="deliveryInfoRef"
      :name="constant.TABLE_NAME_CUSTOMER_DELIVERYINFO"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
    />
    <enter-form-delivery-info
      v-model="enterForm.visible"
      :type="enterForm.type"
      :main-row="mainRow"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
