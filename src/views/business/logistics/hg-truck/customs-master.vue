<!-- 报关运输单 - 报关单 -->
<script>
import { getCustomsMaster } from '@/api/customs/customs-master'
import { bindCustomsCustomsTransport, unBindCustomsCustomsTransport } from '@/api/customs/customs-transport'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import HandleCustoms from './components/handle-customs'

export default {
  name: 'CustomsMaster',
  components: { HandleCustoms },
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      enums,
      constant,
      customs: {
        visible: false,
        type: '',
        title: '',
        rows: []
      },
      request: async ({ pager, params }) => {
        const { data } = await getCustomsMaster({
          ...pager,
          ...transforArrayPayload(
            Object.assign(
              {
                transportId: this.tableRow.id
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
          field: 'declareStatus',
          title: '申报状态',
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
        { field: 'contrNo', title: '合同协议号', searchProps: true },
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
      buttonsConfig: {},
      helpConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  created() {
    this.buttonsConfig = {
      mores: [
        {
          label: '绑定报关单',
          visible: this.permissions[constant.PERMISSION_HG_TRUCK_CUSTOMS_BIND],
          noNeedRows: true,
          handler: row => this.handleCustoms(row)
        },
        {
          label: '解绑报关单',
          visible: this.permissions[constant.PERMISSION_HG_TRUCK_CUSTOMS_UN_BIND],
          multiple: true,
          handler: row => this.handleUnBindCustoms(row)
        }
      ]
    }
  },
  methods: {
    handleCustoms() {
      this.customs = {
        visible: true,
        title: '绑定报关单',
        type: 'bind',
        rows: [this.tableRow]
      }
    },
    async handleHandleCustomsSave(data, done) {
      try {
        await bindCustomsCustomsTransport({ id: this.customs.rows[0].id, customsMasterIds: data.map(v => v.id).join(',') })
        this.$message.success('操作成功')
        this.reLoad()
        this.customs.visible = false
        done()
      } catch (error) {
        done()
      }
    },
    async handleUnBindCustoms(rows) {
      await unBindCustomsCustomsTransport({ id: this.tableRow.id, customsMasterIds: rows.map(v => v.id).join(',') })
      this.reLoad()
      this.$message.success('操作成功')
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
      :name="constant.TABLE_NAME_HG_TRUCK_CUSTOMS_MASTER"
      :columns="columns"
      :request="request"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '100px'
      }"
    />
    <handle-customs
      v-model="customs.visible"
      :type="customs.type"
      :table-rows="customs.rows"
      :title="customs.title"
      :re-load="reLoad"
      @save="handleHandleCustomsSave"
    ></handle-customs>
  </div>
</template>
