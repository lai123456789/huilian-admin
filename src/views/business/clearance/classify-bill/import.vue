<!-- 进口预归类 -->
<script>
import { getOrderImportDetailDeclar } from '@/api/order/order-import-detail-declar'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { jumpCorresOrder } from '@/utils/jump'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'

export default {
  name: 'ImportDetailDeclar',
  components: { EnterForm, Drawer },
  data() {
    return {
      enums,
      constant,
      tableRow: {},
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      request: async ({ pager, params }) => {
        const { data } = await getOrderImportDetailDeclar({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'declareStatus',
          title: '归类状态',
          color: value => {
            return enums.DECLARE_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_STATUS)
            }
          }
        },
        { field: 'declareUser', title: '归类人' },
        { field: 'declareRemark', title: '归类备注' },
        {
          field: 'orderNo',
          title: '订单编号',
          searchProps: true,
          link: row => jumpCorresOrder(row, this, enums.ORDER_TYPE.getFieldByKey('IMPORT'))
        },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'productName', title: '品名' },
        { field: 'productModel', title: '型号', searchProps: true },
        { field: 'productBrand', title: '品牌', searchProps: true },
        { field: 'productOrigin', title: '产地' },
        { field: 'productUnit', title: '单位' },
        {
          field: 'cccFlag',
          title: '是否3C',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IS_3C)
            }
          }
        },
        { field: 'cccNo', title: '3C认证编号' },
        {
          field: 'controlFlag',
          title: '是否管制品',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'controlLicenseNo', title: '管制品许可证号' },
        {
          field: 'exemptionLevy',
          title: '是否减免加征',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        {
          field: 'exemptionTariff',
          title: '是否减免关税',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'customsCode', title: '海关编码', searchProps: true },
        { field: 'customsName', title: '报关名称', searchProps: true },
        { field: 'customsElement', title: '申报要素', textMaxColumnWidth: 200 },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间' }
      ],
      buttonsConfig: {},
      helpConfig: {},
      isBatchClassify: false,
      batchClassifyRows: []
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_CLASSIFY_BILL_IMPORT],
      mark: constant.PERMISSION_CLASSIFY_BILL_IMPORT
    }
    this.buttonsConfig = {
      edit: {
        visible: this.permissions[constant.PERMISSION_CLASSIFY_BILL_IMPORT_EDIT],
        handler: this.handleEdit
      },
      mores: [
        {
          label: '批量归类',
          multiple: true,
          visible: this.permissions[constant.PERMISSION_CLASSIFY_BILL_IMPORT_CLASSIFY],
          handler: this.handleBatchClassify
        }
      ]
    }

    const { openClassifyBillImportDetails } = this.$route.params
    if (openClassifyBillImportDetails) {
      const { orderId } = openClassifyBillImportDetails
      getOrderImportDetailDeclar({ id: orderId }).then(({ data }) => {
        setTimeout(() => {
          this.openDetails({ row: data.records[0] })
        }, 150)
      })
    }
  },
  methods: {
    handleEdit(row) {
      this.tableRow = row

      this.batchClassifyRows = []
      this.isBatchClassify = false

      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleBatchClassify(rows) {
      if (rows.some(row => row.productName !== rows[0].productName)) return this.$message.error('请选择同品名的数据')
      this.batchClassifyRows = rows
      this.isBatchClassify = true

      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    openDetails({ row }) {
      this.tableRow = row
      this.details = {
        visible: true,
        title: ''
      }
    },
    reLoad(isClearSelect) {
      this.$refs['importDetailDeclarRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="import-detail-declar">
    <!-- 列表页 -->
    <base-page
      ref="importDetailDeclarRef"
      :name="constant.TABLE_NAME_CLASSIFY_BILL_IMPORT"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '90px'
      }"
      @cell-dblclick="openDetails"
    />
    <drawer
      :visible.sync="details.visible"
      :title="details.title"
      :table-row="tableRow"
      :order-type="enums.ORDER_TYPE.getFieldByKey('IMPORT')"
    ></drawer>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :order-type="enums.ORDER_TYPE.getFieldByKey('IMPORT')"
      :is-batch-classify="isBatchClassify"
      :batch-classify-rows="batchClassifyRows"
      :type="enterForm.type"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
