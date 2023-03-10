<script>
import { getOrderImportById } from '@/api/order/order-import'
import { getOrderImportDetail } from '@/api/order/order-import-detail'
import { getOrderExportById } from '@/api/order/order-export'
import { getOrderExportDetail } from '@/api/order/order-export-detail'
import { resetHiPriceOrderImportHiPrice } from '@/api/order/order-import-hi-pirce'
import { resetHiPriceOrderExportHiPrice } from '@/api/order/order-export-hi-pirce'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import HistoricalPrice from './components/historical-price'
import EnterFormHiPrice from './components/enter-form-hi-price'

export default {
  name: 'Details',
  components: { HistoricalPrice, EnterFormHiPrice },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    orderType: String,
    reLoad: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      constant,
      enums,
      loading: false,
      request: async ({ pager, params }) => {
        let info = {}
        if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
          const { data } = await getOrderImportDetail({
            ...pager,
            ...transforArrayPayload(
              Object.assign(
                {
                  orderId: this.tableRow.id,
                  declareStatus: enums.DECLARE_STATUS.getFieldByKey('CLASSIFIED')
                },
                params
              )
            )
          })
          info = data
        } else {
          const { data } = await getOrderExportDetail({
            ...pager,
            ...transforArrayPayload(
              Object.assign(
                {
                  orderId: this.tableRow.id,
                  declareStatus: enums.DECLARE_STATUS.getFieldByKey('CLASSIFIED')
                },
                params
              )
            )
          })
          info = data
        }

        return {
          data: info.records,
          total: info.total
        }
      },
      columns: [
        {
          field: 'priceErrorStatus',
          title: '??????????????????',
          color: value => {
            return enums.PRICE_ERROR_STATUS.getFieldByValue(value, 'color')
          },
          searchProps: {
            type: 'select'
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_PRICE_ERROR_STATUS)
            }
          }
        },
        {
          field: 'priceErrorRate',
          title: '??????????????????',
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        { field: 'productName', title: '??????' },
        { field: 'productModel', title: '??????' },
        { field: 'productBrand', title: '??????' },
        { field: 'productOrigin', title: '??????' },
        { field: 'productUnit', title: '??????' },
        { field: 'qty', title: '??????' },
        {
          field: 'price',
          title: '??????',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 }
        },
        { field: 'totalMoney', title: '??????', align: 'right' },
        { field: 'netWeight', title: '??????' },
        { field: 'grossWeight', title: '??????' },
        { field: 'volume', title: '??????' },
        { field: 'packages', title: '??????' },
        { field: 'spq', title: '????????????' },
        { field: 'partNo', title: '??????' },
        { field: 'lotNo', title: '??????' },
        { field: 'dateCode', title: '????????????' },
        {
          field: 'exemptionLevy',
          title: '????????????',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        {
          field: 'exemptionTariff',
          title: '????????????',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'customsName', title: '????????????' },
        { field: 'customsCode', title: '????????????' },
        { field: 'customsElement', title: '????????????', textMaxColumnWidth: 200 },
        { field: 'controlLicenseNo', title: '?????????????????????' },
        { field: 'remark', title: '??????' }
      ],
      buttonsConfig: {},
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        hiPriceStatus: ''
      },
      dispose: {
        hiPriceUser: '',
        hiPriceRemark: ''
      },
      historicalPrice: {
        visible: false,
        row: {}
      },
      showBtns: {
        shenjia: false,
        pass: false,
        rollBack: false
      },
      hiPriceEnterForm: {
        visible: false,
        title: '',
        row: {}
      },
      dicts: {},
      rightLabelWidth: '70px'
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.buttonsConfig = {
      mores: [
        {
          label: '??????????????????',
          multiple: true,
          visible:
            this.permissions[
              this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
                ? constant.PERMISSION_PRICE_REVIEW_IMPORT_DETAILS_LSJG
                : constant.PERMISSION_PRICE_REVIEW_EXPORT_DETAILS_LSJG
            ],
          handler: this.handleHistoricalPrice
        }
      ]
    }
    this.getDetailsData()
  },
  methods: {
    async getDetailsData() {
      let res = null
      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        res = await getOrderImportById(this.tableRow.id)
      } else {
        res = await getOrderExportById(this.tableRow.id)
      }
      const { hiPriceUser, hiPriceRemark, hiPriceStatus, createByName, createTime } = res.data

      this.showBtns = {
        shenjia:
          this.permissions[
            this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
              ? constant.PERMISSION_PRICE_REVIEW_IMPORT_SHENJIA
              : constant.PERMISSION_PRICE_REVIEW_EXPORT_SHENJIA
          ],
        pass: this.permissions[
          this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
            ? constant.PERMISSION_PRICE_REVIEW_IMPORT_PASS
            : constant.PERMISSION_PRICE_REVIEW_EXPORT_PASS
        ],
        rollBack:
          this.permissions[
            this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')
              ? constant.PERMISSION_PRICE_REVIEW_IMPORT_ROLLBACK
              : constant.PERMISSION_PRICE_REVIEW_EXPORT_ROLLBACK
          ]
      }

      this.createForm = {
        createByName,
        createTime
      }

      this.dispose = {
        hiPriceUser,
        hiPriceRemark
      }

      this.statusForm = {
        hiPriceStatus
      }
    },
    handleHistoricalPrice(rows) {
      Object.assign(this.historicalPrice, {
        visible: true,
        row: rows[0]
      })
    },
    handlePass() {
      this.hiPriceEnterForm = {
        visible: true,
        title: '????????????',
        row: {
          hiPriceStatus: enums.HI_PRICE_STATUS.getFieldByKey('APPRAISAL_PASSED'),
          orderId: this.tableRow.id
        }
      }
    },
    handleRollback() {
      this.hiPriceEnterForm = {
        visible: true,
        title: '???????????????',
        row: {
          hiPriceStatus: enums.HI_PRICE_STATUS.getFieldByKey('PRICE_REVIEW_FAILED'),
          orderId: this.tableRow.id
        }
      }
    },
    async handleReviewPrice() {
      if (this.orderType === enums.ORDER_TYPE.getFieldByKey('IMPORT')) {
        await resetHiPriceOrderImportHiPrice(this.tableRow.id)
      } else {
        await resetHiPriceOrderExportHiPrice(this.tableRow.id)
      }
      this.$message.success('????????????')
      this.handleUpdateInfoReload()
    },
    // ????????????????????????????????????????????????
    handleUpdateInfoReload() {
      this.getDetailsData()
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate classify-bill"
    element-loading-text="???????????????"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-main">
          <base-page
            :name="constant.TABLE_NAME_PRICE_REVIEW_IMPORT_DETAILS"
            :columns="columns"
            :request="request"
            :search-config="{
              labelWidth: '120px'
            }"
            :buttons-config="buttonsConfig"
          />
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">??????</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div
              class="dcommon-etails-r-value"
              :style="{ color: enums.HI_PRICE_STATUS.getFieldByValue(statusForm.hiPriceStatus, 'color') }"
            >
              {{ enums.HI_PRICE_STATUS.getFieldByValue(statusForm.hiPriceStatus) }}
            </div>
          </div>

          <el-divider content-position="left">????????????</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">?????????:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>

          <el-divider content-position="left">????????????</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">?????????:</div>
            <div class="dcommon-etails-r-value">{{ dispose.hiPriceUser || '-' }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">????????????:</div>
            <div class="common-operate-r-value">{{ dispose.hiPriceRemark || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <el-button v-if="showBtns.shenjia" type="primary" @click="handleReviewPrice">????????????</el-button>
        <el-button v-if="showBtns.pass" type="success" @click="handlePass">????????????</el-button>
        <el-button v-if="showBtns.rollBack" type="danger" @click="handleRollback">???????????????</el-button>
      </div>
    </div>
    <historical-price
      v-model="historicalPrice.visible"
      :order-type="orderType"
      :table-row="tableRow"
      :main-row="historicalPrice.row"
      :re-load="handleUpdateInfoReload"
    ></historical-price>
    <enter-form-hi-price
      v-model="hiPriceEnterForm.visible"
      :title="hiPriceEnterForm.title"
      :order-type="orderType"
      :table-row="hiPriceEnterForm.row"
      :re-load="handleUpdateInfoReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.classify-bill {
  .common-operate-l {
    display: inline-block;
    overflow: inherit;
    width: calc(100% - 240px);
    &-main {
      overflow: auto;
      padding: 10px;
      height: 100%;
      box-sizing: border-box;
    }
  }
  .classify-table {
    width: 100%;
    border: 1px solid var(--color-primary);
    .classify-elements {
      width: 100%;
      border: 1px solid var(--color-primary);
      .title {
        font-weight: 700;
      }
    }
    td {
      width: 25%;
      font-size: 14px;
      border: 1px solid var(--color-primary);
      &.label {
        width: 20%;
        background-color: #eef5fe;
        .content {
          padding-top: 0;
          padding-bottom: 0;
          height: 34px;
          line-height: 34px;
        }
      }
      .content {
        padding: 5px 10px;
        ::v-deep .el-form-item--mini.el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
