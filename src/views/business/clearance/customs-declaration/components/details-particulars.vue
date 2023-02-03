<script>
import { splitCustomsMasterByDetailIds } from '@/api/customs/customs-master'
import { mergerDetailCustomsMasterDetail } from '@/api/customs/customs-master-detail'
import { getDataDictionary } from '@/api/admin/dicts'
import Grid from './grid'
import constant from '@/constant'
import ParticularsForm from './particulars-form'
import Classify from './classify'
import MaimBulkEdit from './maim-bulk-edit'

export default {
  name: 'DetailsParticulars',
  components: { Grid, ParticularsForm, Classify, MaimBulkEdit },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    tableRow: {
      type: Object,
      default: () => ({})
    },
    reLoad: {
      type: Function,
      default: () => () => {}
    },
    orderType: String,
    handleSummary: Function
  },
  data() {
    return {
      classify: {
        visible: false
      },
      bulkEdit: {
        visible: false
      }
    }
  },
  methods: {
    // 获取父级的数据
    async setData(form) {
      const { tradeCurr, customsMasterDetailVOList } = form
      this.$refs.gridRef.loadColumns([
        { field: 'productModel', title: '型号', width: 120 },
        { field: 'productBrand', title: '品牌', width: 120 },
        {
          field: 'declareStatus',
          title: '归类状态',
          width: 100,
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_STATUS)
            }
          }
        },
        { field: 'codeTS', title: '商品编号', width: 110 },
        { field: 'productName', title: '品名', width: 120 },
        { field: 'gName', title: '报关名称', width: 140 },
        { field: 'gModel', title: '规格', width: 200 },
        { field: 'gQty', title: '成交数量', width: 100 },
        { field: 'gUnit', title: '成交单位', width: 100 },
        {
          field: 'customsPrice',
          title: '报关单价',
          width: 120,
          sum: true,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          },
          footerConfig: { precision: 6 }
        },
        {
          field: 'customsTotal',
          title: '报关总价',
          width: 120,
          formatter: {
            type: 'number',
            config: {
              precision: 2
            }
          }
        },
        {
          field: 'declPrice',
          title: '申报单价',
          width: 120,
          formatter: {
            type: 'number',
            config: {
              precision: 4
            }
          }
        },
        {
          field: 'declTotal',
          title: '申报总价',
          width: 120,
          formatter: {
            type: 'number',
            config: {
              precision: 2
            }
          }
        },
        { field: 'tradeCurr', title: '币制', width: 110 },
        { field: 'packages', title: '件数', width: 100 },
        {
          field: 'netWeight',
          title: '净重',
          width: 100,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        {
          field: 'grossWeight',
          title: '毛重',
          width: 100,
          formatter: {
            type: 'number',
            config: {
              precision: 6
            }
          }
        },
        { field: 'originCountry', title: '原产国(地区)', width: 120 },
        { field: 'inspectionCategory', title: '商检监管条件', width: 100 },
        { field: 'supervisionCondition', title: '海关监管条件', width: 100 },
        {
          field: 'controlFlag',
          title: '是否管制品',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          },
          width: 110
        },
        { field: 'controlLicenseNo', title: '管制品许可证号', width: 120 },
        {
          field: 'cccFlag',
          title: '是否3c',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IS_3C)
            }
          },
          width: 90
        },
        { field: 'cccNo', title: '3C认证编号', width: 120 },
        {
          field: 'exemptionLevy',
          title: '减免关税',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          },
          width: 90
        },
        {
          field: 'exemptionTariff',
          title: '减免加征',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          },
          width: 90
        },
        {
          field: 'taxRate',
          title: '关税率(%)',
          width: 90,
          formatter: {
            type: 'percent'
          }
        },
        {
          field: 'vatRate',
          title: '增值税率(%)',
          width: 90,
          formatter: {
            type: 'percent'
          }
        },
        {
          field: 'exciseRate',
          title: '消费税率(%)',
          width: 90,
          formatter: {
            type: 'percent'
          }
        },
        { field: 'taxMoney', title: '关税', width: 90 },
        { field: 'vatMoney', title: '增值税', width: 90 },
        { field: 'exciseMoney', title: '消费税', width: 90 }
      ])
      const { data } = await this.$refs.gridRef.getVxeGridInstance().loadData(
        (customsMasterDetailVOList || []).map(v => ({ ...v, tradeCurr })),
        'cover'
      )
      this.handleSummary(data)
    },
    handleCurrentChange(row) {
      this.$refs.particularsFormRef.parentAssignForm(
        Object.assign(row, {
          itemNo: this.$refs.gridRef.getVxeGridInstance().getVxeGridInstance().getVTRowIndex(row) + 1
        })
      )
    },
    handleCurrentClear() {
      this.form = this.$refs.particularsFormRef.parentClearForm()
    },
    handleSave() {
      const currentRecords = this.$refs.gridRef.getCurrentRecord()
      Object.assign(currentRecords, this.$refs.particularsFormRef.form)
      this.handleSummary(this.$refs.gridRef.getVxeGridInstance().getRecords())
    },
    handleUpMove() {
      this.$refs.gridRef.getVxeGridInstance().handleUpSort()
    },
    handleDownMove() {
      this.$refs.gridRef.getVxeGridInstance().handleDownSort()
    },
    handleMergerDetail(selectRecords) {
      this.$confirm('确认是否合并?')
        .then(() => {
          mergerDetailCustomsMasterDetail({
            customsMasterId: this.tableRow.id,
            customsMasterDetailIds: selectRecords.map(v => v.id).join(',')
          }).then(() => {
            this.reLoad()
            this.$message.success('操作成功')
          })
        })
        .catch(() => {})
    },
    handleSplit(selectRecords) {
      this.$confirm('确认是否拆分?')
        .then(() => {
          splitCustomsMasterByDetailIds({
            customsId: this.tableRow.id,
            customsDetailIds: selectRecords.map(v => v.id).join(',')
          }).then(() => {
            this.reLoad()
            this.$message.success('操作成功')
          })
        })
        .catch(() => {})
    },
    handleMaimBulkEdit() {
      this.bulkEdit.visible = true
    },
    handleMaimClassify(selectRecords) {
      this.classify.visible = true
      const {
        id,
        productBrand,
        productModel,
        cccFlag,
        cccNo,
        controlFlag,
        controlLicenseNo,
        exemptionLevy,
        exemptionTariff,
        codeTS,
        codeTSName,
        hsCode,
        hsName,
        gName,
        firstUnit,
        secondUnit,
        vatRate,
        exciseRate,
        taxRate,
        rebateRate,
        declareRemark,
        customsMasterDetailElementVOList
      } = selectRecords[0]
      this.$refs.classifyRef.handleAssignForm({
        id,
        productBrand,
        productModel,
        cccFlag,
        cccNo,
        controlFlag,
        controlLicenseNo,
        exemptionLevy,
        exemptionTariff,
        customsCode: codeTS,
        customsName: gName,
        ciqCode: hsCode,
        ciqName: hsName,
        customsCodeName: codeTSName,
        declareRemark,
        firstUnit,
        secondUnit,
        vatRate,
        exciseRate,
        taxRate,
        rebateRate,
        classifyElements: customsMasterDetailElementVOList || []
      })
    },
    getVxeGridInstance() {
      return this.$refs.gridRef
    }
  }
}
</script>

<template>
  <div class="details-particulars">
    <grid ref="gridRef" height="250px" seq-name="项号" @current-change="handleCurrentChange" @current-clear="handleCurrentClear">
      <template v-slot:buttons="{ selectRecords }">
        <div>
          <el-button size="mini" :disabled="disabled" type="primary" @click="handleSave">保存</el-button>
          <el-button
            size="mini"
            :disabled="disabled || !selectRecords.length || selectRecords.length > 1"
            type="success"
            @click="handleUpMove"
            >上移</el-button
          >
          <el-button
            size="mini"
            :disabled="disabled || !selectRecords.length || selectRecords.length > 1"
            type="success"
            @click="handleDownMove"
            >下移</el-button
          >
          <el-button
            size="mini"
            :disabled="disabled || !selectRecords.length || selectRecords.length !== 2"
            type="primary"
            @click="handleMergerDetail(selectRecords)"
            >合并</el-button
          >
          <el-button size="mini" :disabled="!selectRecords.length" type="primary" @click="handleSplit(selectRecords)">拆分</el-button>
          <el-button
            size="mini"
            :disabled="!selectRecords.length || selectRecords.length > 1"
            type="primary"
            @click="handleMaimClassify(selectRecords)"
            >归类</el-button
          >
          <el-button size="mini" :disabled="disabled || !selectRecords.length" type="warning" @click="handleMaimBulkEdit"
            >批量修改</el-button
          >
        </div>
      </template>
    </grid>
    <particulars-form ref="particularsFormRef" :order-type="orderType" :disabled="disabled"></particulars-form>
    <classify
      ref="classifyRef"
      v-model="classify.visible"
      :order-type="orderType"
      :disabled="disabled"
      :re-load="reLoad"
      :current-clear="handleCurrentClear"
    />
    <maim-bulk-edit v-model="bulkEdit.visible" :order-type="orderType" :get-vxe-grid-instance="getVxeGridInstance" />
  </div>
</template>

<style lang="scss" scoped>
.details-particulars {
  ::v-deep .base-edit-table {
    padding: 0;
    .vxe-grid--toolbar-wrapper {
      .el-button {
        margin-top: 3px;
        margin-bottom: 3px;
        padding: 5px 12px;
        & + .el-button {
          margin-left: 3px;
        }
      }
    }
  }
}
</style>
