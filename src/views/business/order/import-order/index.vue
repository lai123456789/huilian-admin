<!-- 进口订单 -->
<script>
import { getOrderImport, deleteOrderImportById } from '@/api/order/order-import'
import { resetHiPriceOrderImportHiPrice } from '@/api/order/order-import-hi-pirce'
import { generateCustomsMasterByOrderId } from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import Drawer from './components/drawer'
import EnterForm from './components/enter-form'
import dayjs from '@/utils/day'
import { isFunction } from 'xe-utils'

export default {
  name: 'ImportOrder',
  components: { Drawer, EnterForm },
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
        const { data } = await getOrderImport({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'customerName', title: '委托客户', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'orderNo', title: '订单编号', searchProps: true },
        {
          field: 'auditStatus',
          title: '审核状态',
          color: value => {
            return enums.AUDIT_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_AUDIT_STATUS)
            }
          }
        },
        {
          field: 'hiPriceStatus',
          title: '审价状态',
          searchProps: {
            type: 'select',
            attrs: {
              multiple: true
            }
          },
          color: value => {
            return enums.HI_PRICE_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_HI_PRICE_STATUS)
            }
          }
        },
        {
          field: 'receivingStatus',
          title: '入库状态',
          color: value => {
            return enums.RECEIVING_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RECEIVING_STATUS)
            }
          }
        },

        {
          field: 'shippingStatus',
          title: '出库状态',
          color: value => {
            return enums.WARE_SHIPPING_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WARE_SHIPPING_STATUS)
            }
          }
        },

        {
          field: 'customsStatus',
          title: '报关状态',
          color: value => {
            return enums.DECLARATION_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARATION_STATUS)
            }
          }
        },

        {
          field: 'tradeMode',
          title: '贸易模式',
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRADE_MODE)
            }
          }
        },
        { field: 'orderDate', title: '订单日期', searchProps: { type: 'date', sort: 1 } },
        { field: 'cusOrderNo', title: '客户合同号', searchProps: true },
        {
          field: 'cusContractNo',
          title: '客户协议',
          searchProps: true,
          link: { name: constant.ROUTE_SERVICE_AGREE, toField: 'contractNo' }
        },
        { field: 'supplierName', title: '供应商名称', searchProps: true, link: { name: constant.ROUTE_SUPPLIER, toField: 'companyName' } },
        { field: 'principalName', title: '签约主体', link: { name: constant.ROUTE_COMPANY, toField: 'companyName' } },
        { field: 'currencyName', title: '报关币别' },
        {
          field: 'totalMoney',
          title: '报关总价',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },

        { field: 'hiPriceRemark', title: '审价备注' },

        {
          field: 'cargoSettleStatus',
          title: '货款结算状态',
          color: value => {
            return enums.SETTLE_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SETTLE_STATUS)
            }
          }
        },

        {
          field: 'taxSettleStatus',
          title: '税代费结算状态',
          color: value => {
            return enums.SETTLE_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_SETTLE_STATUS)
            }
          }
        },

        {
          field: 'declareTitle',
          title: '抬头方式',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_TITLE)
            }
          }
        },
        { field: 'incoterms', title: '成交方式' },
        { field: 'packageType', title: '包装种类' },
        {
          field: 'agentCustomsStatus',
          title: '是否委外报关',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'agentCustomsName', title: '报关行', searchProps: true },
        { field: 'tradeManName', title: '商务名称' },
        { field: 'remark', title: '备注', searchProps: true },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      nearlyMonths: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_BUS_IMPORT],
      mark: constant.PERMISSION_BUS_IMPORT
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BUS_IMPORT_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '复制',
          visible: this.permissions[constant.PERMISSION_BUS_IMPORT_COPY],
          handler: rows => this.handleCopyOrder(rows)
        },
        {
          label: '重置审价',
          visible: this.permissions[constant.PERMISSION_BUS_IMPORT_SHENJIA],
          handler: rows => this.handleReviewPrice(rows)
        },
        {
          label: '生成报关单',
          visible: this.permissions[constant.PERMISSION_BUS_IMPORT_GEN_CUSTOMS],
          handler: rows => this.generateCustomsMaster(rows)
        }
      ]
    }
  },
  methods: {
    handleAdded() {
      this.$refs.enterFormRef.handleCopyOrder(false)
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
          deleteOrderImportById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['imortOrderRef'].handleTableClearCheckbox(true)
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
    handleCopyOrder(rows) {
      this.$confirm('是否复制订单明细?', '', {
        confirmButtonText: '是',
        cancelButtonText: '否'
      })
        .then(() => {
          this.$refs.enterFormRef.handleCopyOrder(true, rows[0], true)
          this.enterForm = {
            visible: true,
            type: enums.FORM_TYPE.getFieldByKey('ADDED')
          }
        })
        .catch(() => {
          this.$refs.enterFormRef.handleCopyOrder(true, rows[0])
          this.enterForm = {
            visible: true,
            type: enums.FORM_TYPE.getFieldByKey('ADDED')
          }
        })
    },
    async handleReviewPrice(rows) {
      const { id } = rows[0]
      await resetHiPriceOrderImportHiPrice(id)
      this.$message.success('审价成功')
    },
    async generateCustomsMaster(rows) {
      const { id, auditStatus, receivingStatus } = rows[0]
      if (
        !(
          auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS') &&
          (receivingStatus === enums.RECEIVING_STATUS.getFieldByKey('SUCCESS') ||
            receivingStatus === enums.RECEIVING_STATUS.getFieldByKey('PART'))
        )
      ) {
        return this.$message.error('请选择已审核、已入库或者部分入库的数据')
      }
      await generateCustomsMasterByOrderId({ orderId: id, orderType: enums.ORDER_TYPE.getFieldByKey('IMPORT') })
      this.$message.success('操作成功')
    },
    openDetails({ row }) {
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    // 详情编辑保存会执行该方法
    handleEditDetailsTitle(form) {
      // 进口订单编号系统编码的状态为禁用时，详情页标题取客户合同号字段，反之取订单编号字段
      this.details.title = form.isCusOrderNoRequired ? form.cusOrderNo : form.orderNo
    },
    reLoad(isClearSelect) {
      this.$refs['imortOrderRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="import-order">
    <!-- 列表页 -->
    <base-page
      ref="imortOrderRef"
      :name="constant.TABLE_NAME_IMPORT_ORDER"
      show-footer
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '105px',
        form: {
          orderDate: nearlyMonths
        }
      }"
      @cell-dblclick="openDetails"
    />
    <drawer
      :visible.sync="details.visible"
      :title="details.title"
      :table-row="tableRow"
      :re-load="reLoad"
      :delete-fn="handleDel"
      @edit-details-title="handleEditDetailsTitle"
    ></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
