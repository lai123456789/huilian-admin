<!-- 入库异常记录 -->
<script>
import {
  getOrderReceivingError,
  handleOrderImportOrderReceivingError,
  handleOrderExportOrderReceivingError,
  handleOrderAgentPurchaseOrderReceivingError,
  handleOrderPurchaseOrderReceivingError,
  handleOrderAgentSaleOrderReceivingError,
  handleOrderStorageOrderReceivingError,
  handleOrderAgentFreightOrderReceivingError
} from '@/api/order/order-receiving-error'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'

const form = {
  handleResult: '',
  handleRemark: ''
}

export default {
  name: 'ReceivingError',
  components: {},
  props: {
    tableRow: Object,
    permissionsReceivingError: Object
  },
  data() {
    return {
      constant,
      visible: false,
      handleResults: [],
      form: clone(form, true),
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getOrderReceivingError({
          ...pager,
          ...transforArrayPayload(Object.assign({ orderId: this.tableRow.id, orderType: this.tableRow.orderType }, params))
        })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'errorType',
          title: '异常类型',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WAREHOUS_ERROR_TYPE)
            }
          }
        },
        {
          field: 'status',
          title: '状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DISPOSE_STATUS)
            }
          },
          color: value => {
            return enums.DISPOSE_STATUS.getFieldByValue(value, 'color')
          }
        },
        { field: 'handleResult', title: '处理结果' },
        { field: 'handleRemark', title: '处理意见' },
        { field: 'orderProductNo', title: '原商品编号' },
        { field: 'receivingProductNo', title: '入库商品编号', color: (value, row) => this.verifyRawEqual(value, row, 'orderProductNo') },
        { field: 'orderProductName', title: '原品名' },
        { field: 'receivingProductName', title: '入库品名', color: (value, row) => this.verifyRawEqual(value, row, 'orderProductName') },
        { field: 'orderProductModel', title: '原型号' },
        { field: 'receivingProductModel', title: '入库型号', color: (value, row) => this.verifyRawEqual(value, row, 'orderProductModel') },
        { field: 'orderProductBrand', title: '原品牌' },
        { field: 'receivingProductBrand', title: '入库品牌', color: (value, row) => this.verifyRawEqual(value, row, 'orderProductBrand') },
        { field: 'orderProductOrigin', title: '原产地' },
        {
          field: 'receivingProductOrigin',
          title: '入库产地',
          color: (value, row) => this.verifyRawEqual(value, row, 'orderProductOrigin')
        },
        { field: 'orderQty', title: '原数量' },
        { field: 'receivingQty', title: '入库数量', color: (value, row) => this.verifyRawEqual(value, row, 'orderQty') },
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
      mores: [
        {
          label: '异常处理',
          visible: this.permissions[this.permissionsReceivingError.exception],
          multiple: true,
          handler: rows => this.handleExceptionRecord(rows)
        }
      ]
    }
  },
  methods: {
    handleExceptionRecord(rows) {
      if (rows.some(row => row.errorType !== rows[0].errorType)) return this.$message.error('请选择同异常类型的记录')
      if (rows.some(row => row.status === enums.DISPOSE_STATUS.getFieldByKey('YES'))) return this.$message.error('请选择未处理的异常记录')
      const { errorType } = rows[0]

      const handleResult = {
        0: [
          { label: '确认不到货', value: '确认不到货' },
          { label: '等待到货', value: '等待到货' }
        ],
        1: [{ label: '确认修改', value: '确认修改' }],
        2: [{ label: '确认拆分', value: '确认拆分' }],
        3: [
          { label: '确认不到货', value: '确认不到货' },
          { label: '等待到货', value: '等待到货' }
        ]
      }
      this.handleResults = handleResult[errorType]
      Object.assign(this.form, {
        ids: rows.map(row => row.id).join(','),
        orderId: this.tableRow.id,
        handleResult: this.handleResults[0].value,
        handleRemark: ''
      })
      this.visible = true
    },
    handleSave(done) {
      this.$refs['formRef'].validate(async (valid, invalidFields) => {
        if (valid) {
          try {
            if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
              await handleOrderImportOrderReceivingError(this.form)
              /* 出口订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('EXPORT')) {
              await handleOrderExportOrderReceivingError(this.form)
              /* 代采订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_PURCHASE')) {
              await handleOrderAgentPurchaseOrderReceivingError(this.form)
              /* 代销订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_SALE')) {
              await handleOrderAgentSaleOrderReceivingError(this.form)
              /* 采购订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('PURCHASE')) {
              await handleOrderPurchaseOrderReceivingError(this.form)
              /* 仓储订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('STORAGE')) {
              await handleOrderStorageOrderReceivingError(this.form)
              /* 货代订单 */
            } else if (this.tableRow.orderType === enums.ORDER_TYPE.getFieldByKey('AGENT_FREIGHT')) {
              await handleOrderAgentFreightOrderReceivingError(this.form)
            }
            this.$message.success('操作成功')
            this.reLoad()
            done()
            this.visible = false
          } catch (error) {
            done()
          }
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          done()
        }
      })
    },
    verifyRawEqual(value, row, rawName) {
      // eslint-disable-next-line eqeqeq
      return value != row[rawName] ? '#ff0000' : null
    },
    reLoad(isClearSelect) {
      this.$refs['receivingErrorRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="receiving-error">
    <!-- 列表页 -->
    <base-page
      ref="receivingErrorRef"
      :name="constant.TABLE_NAME_COMMON_EXCEPTION"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
    />

    <base-dialog :visible.sync="visible" title="处理异常记录" width="500px" @save="handleSave">
      <base-form ref="formRef" :model="form" labbase-suffix=":" labbase-width="70px" size="mini">
        <base-row>
          <base-col :span="24">
            <base-form-item label="处理结果" prop="handleResult">
              <base-radio v-model="form.handleResult" is-group :options="handleResults" />
            </base-form-item>
          </base-col>

          <base-col :span="24">
            <base-form-item label="处理意见" prop="handleRemark">
              <base-input v-model="form.handleRemark" type="textarea" placeholder="请输入处理意见" />
            </base-form-item>
          </base-col>
        </base-row>
      </base-form>
    </base-dialog>
  </div>
</template>
