<!-- 商品归类库 -->
<script>
import { getCustomsDeclar, deleteCustomsDeclarById } from '@/api/customs/customs-declar'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import BigNumber from '@/utils/big-number'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'CustomsDeclar',
  components: { EnterForm, Drawer },
  data() {
    return {
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
      isBatchClassify: false,
      batchClassifyRows: [],
      request: async ({ pager, params }) => {
        const { data } = await getCustomsDeclar({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'productModel', title: '型号', searchProps: true },
        { field: 'productBrand', title: '品牌', searchProps: true },
        { field: 'customsCode', title: '海关编码', searchProps: true },
        { field: 'customsCodeName', title: '海关编码名称', searchProps: true },
        { field: 'customsName', title: '报关名称', searchProps: true },
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
        { field: 'cccNo', title: '3C认证编码', searchProps: true },
        { field: 'supervisionCondition', title: '监管条件' },
        { field: 'inspectionCategory', title: '检验检疫类别' },
        { field: 'firstUnit', title: '第一法定单位' },
        { field: 'secondUnit', title: '第二法定单位' },
        {
          field: 'exRate',
          title: '(出口)关税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exRebateRate',
          title: '(出口)退税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exTentativeRate',
          title: '(出口)暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'vatRate',
          title: '(进口)增值税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'preferentialRate',
          title: '(进口)最惠国税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imTentativeRate',
          title: '(进口)暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imGeneralRate',
          title: '(进口)普通国税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exciseRate',
          title: '(进口)消费税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
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
      show: this.permissions[constant.PERMISSION_CLASSIFY],
      mark: constant.PERMISSION_CLASSIFY
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_CLASSIFY_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_CLASSIFY_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_CLASSIFY_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '批量归类',
          multiple: true,
          visible: this.permissions[constant.PERMISSION_CLASSIFY_BATCH_CLASSIFY],
          handler: this.handleBatchClassify
        }
      ]
    }
  },
  methods: {
    handleAdded() {
      this.batchClassifyRows = []
      this.isBatchClassify = false

      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row

      this.batchClassifyRows = []
      this.isBatchClassify = false

      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteCustomsDeclarById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsDeclarRef'].handleTableClearCheckbox(true)
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
      const { customsCode } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: customsCode
      }
    },
    handleBatchClassify(rows) {
      if (rows.some(row => row.productBrand !== rows[0].productBrand)) return this.$message.error('请选择同品牌的数据')
      this.batchClassifyRows = rows
      this.isBatchClassify = true

      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    reLoad(isClearSelect) {
      this.$refs['customsDeclarRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-declar">
    <!-- 列表页 -->
    <base-page
      ref="customsDeclarRef"
      :name="constant.TABLE_NAME_CLASSIFY"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form
      ref="enterFormRef"
      v-model="enterForm.visible"
      :type="enterForm.type"
      :is-batch-classify="isBatchClassify"
      :batch-classify-rows="batchClassifyRows"
      :table-row="tableRow"
      :re-load="reLoad"
    />
  </div>
</template>
