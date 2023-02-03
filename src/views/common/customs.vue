<!-- 报关单 -->
<script>
import { getCustomsMaster, getCustomsMasterById } from '@/api/customs/customs-master'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'

export default {
  name: 'CustomsMaster',
  components: {},
  props: {
    tableRow: Object,
    permissionsCustoms: Object
  },
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      mainRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCustomsMaster({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                orderId: this.tableRow.id,
                iEFlag: this.tableRow.orderType
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
          field: 'declareStatus',
          title: '申报状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARATION_STATUS)
            }
          }
        },
        {
          field: 'manifestStatus',
          title: '舱单申报状态',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_MANIFEST_DECLARATION_STATUS)
            }
          }
        },
        { field: 'orderNo', title: '订单编号', searchProps: true, visible: false },
        {
          field: 'iEFlag',
          title: '进出口标志',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'declareDate', title: '申报日期', searchProps: { type: 'date' } },
        { field: 'iEDate', title: '进出口日期' },
        { field: 'contrNo', title: '合同协议号', searchProps: true, link: { name: constant.ROUTE_CUSTOMS_DECLARATION, toField: true } },
        { field: 'billNo', title: '提运单号', searchProps: true },
        {
          field: 'declareType',
          title: '申报类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_DECLARE_TYPE)
            }
          }
        },
        {
          field: 'helpCommit',
          title: '是否辅助申报',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        { field: 'cargoListNo', title: '航次号' },
        { field: 'transportNo', title: '运输单号', searchProps: true },
        { field: 'entryId', title: '报关单号', searchProps: true },
        { field: 'declareTitle', title: '抬头方式' },
        { field: 'transMode', title: '成交方式' },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'tradeName', title: '境内收发货人', searchProps: true },
        { field: 'overseasConsignorEname', title: '境外收发货人', searchProps: true },
        { field: 'agentName', title: '申报单位' },
        { field: 'tradeCurr', title: '报关币别' },
        { field: 'totalMoney', title: '申报总价', align: 'right' },
        { field: 'customsRate', title: '海关汇率' },
        { field: 'remark', title: '备注' },
        { field: 'createByName', title: '创建人名称' },
        { field: 'createTime', title: '创建时间', searchProps: { type: 'datetime' } }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      del: {
        visible: this.permissions[this.permissionsCustoms.del],
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
      this.mainRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          getCustomsMasterById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsMasterRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['customsMasterRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-master">
    <!-- 列表页 -->
    <base-page
      ref="customsMasterRef"
      :name="constant.TABLE_NAME_COMMOM_CUSTOMS"
      :columns="columns"
      :request="request"
      show-footer
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '130px'
      }"
    />
  </div>
</template>
