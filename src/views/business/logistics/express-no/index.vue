<!-- 快递发货单 -->
<script>
import { getWareDeliveryExpress, deleteWareDeliveryExpressById } from '@/api/warehouse/ware-delivery-express'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'DeliveryExpress',
  components: { EnterForm, Drawer },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getWareDeliveryExpress({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'auditStatus',
          title: '审核状态',
          color: value => {
            return enums.AUDIT_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select',
            attrs: {
              multiple: true
            }
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AUDIT_STATUS)
            }
          }
        },
        { field: 'deliveryNo', title: '发货单号', searchProps: true },
        { field: 'warehouseName', title: '仓库名称', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: true } },
        { field: 'expressDate', title: '发货时间', searchProps: { type: 'datetime' } },
        {
          field: 'expressName',
          title: '快递服务商',
          searchProps: true,
          link: { name: constant.ROUTE_TRAN_DRIVER, toField: 'companyName' }
        },
        { field: 'expressNo', title: '快递单号', searchProps: true },
        { field: 'expressPerson', title: '发货人' },
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
      show: this.permissions[constant.PERMISSION_EXPRESS_NO],
      mark: constant.PERMISSION_EXPRESS_NO
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_EXPRESS_NO_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_EXPRESS_NO_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_EXPRESS_NO_DEL],
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
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteWareDeliveryExpressById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['deliveryExpressRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
            // 第二个参数可能是在page组件下的buttons组件里面定义的loading状态对象，因此需要判断是否为函数
            if (cb && isFunction(cb)) {
              cb()
            }
          })
        })
        .catch(() => {})
    },
    openDetails({ row }) {
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    reLoad(isClearSelect) {
      this.$refs['deliveryExpressRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="delivery-express">
    <!-- 列表页 -->
    <base-page
      ref="deliveryExpressRef"
      :name="constant.TABLE_NAME_EXPRESS_NO"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
