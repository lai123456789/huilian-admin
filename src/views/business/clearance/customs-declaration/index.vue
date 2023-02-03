<!-- 报关单 -->
<script>
import {
  getCustomsMaster,
  deleteCustomsMasterById,
  goodsDeclareCustomsMaster,
  goodsDeclareRollbackCustomsMaster,
  manifestDeclareCustomsMaster
} from '@/api/customs/customs-master'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import Drawer from './components/drawer'
import Split from './components/split'
import ManifestChange from './components/manifest-change'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'CustomsDeclaration',
  components: { Drawer, Split, ManifestChange },
  data() {
    return {
      constant,
      details: {
        visible: false,
        title: ''
      },
      split: {
        visible: false,
        row: {}
      },
      manifestChange: {
        visible: false,
        type: 'change',
        row: {},
        title: '舱单变更申报'
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCustomsMaster({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'transportNo', title: '运输单号', searchProps: true, link: { name: constant.ROUTE_HG_TRUCK, toField: true } },
        { field: 'entryId', title: '报关单号', searchProps: true },
        { field: 'declareTitle', title: '抬头方式' },
        { field: 'transMode', title: '成交方式' },
        { field: 'customerName', title: '客户名称', searchProps: true, link: { name: constant.ROUTE_CUSTOMER, toField: 'companyName' } },
        { field: 'tradeName', title: '境内收发货人', searchProps: true },
        { field: 'overseasConsignorEname', title: '境外收发货人', searchProps: true },
        { field: 'agentName', title: '申报单位' },
        { field: 'tradeCurr', title: '报关币别' },
        {
          field: 'declTotal',
          title: '总价',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
        {
          field: 'customsTotal',
          title: '报关总价',
          align: 'right',
          sum: true,
          formatter: {
            type: 'number'
          }
        },
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
    this.helpConfig = {
      show: this.permissions[constant.PERMISSION_CUS_DECLAR],
      mark: constant.PERMISSION_CUS_DECLAR
    }
    this.buttonsConfig = {
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '拆单',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_SPLIT],
          handler: this.handleSplit
        },
        // {
        //   label: '代理委托申报',
        //   visible: true,
        //   multiple: true,
        //   handler: (rows) => this.handleGoodsAcdDeclare(rows)
        // },
        {
          label: '整合申报',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE],
          multiple: true,
          handler: rows => this.handleGoodsDeclar(rows, enums.DECLARE_TYPE.getFieldByKey('GOODS_DECLARE'))
        },
        {
          label: '两步申报一次录入',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE_ONE],
          multiple: true,
          handler: rows => this.handleGoodsDeclar(rows, enums.DECLARE_TYPE.getFieldByKey('DECLARE_ONE'))
        },
        {
          label: '舱单申报',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST],
          multiple: true,
          handler: rows => this.handleManifestDeclare(rows)
        },
        {
          label: '舱单变更',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST_UPDATE],
          multiple: true,
          handler: rows => this.handleManifestChange(rows, 'change')
        },
        {
          label: '报关申报回退',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE_BACK],
          multiple: true,
          type: 'danger',
          handler: rows => this.handleGoodsDeclarRollback(rows)
        },
        {
          label: '删除舱单',
          visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST_DEL],
          multiple: true,
          type: 'danger',
          handler: rows => this.handleManifestChange(rows, 'delete')
        }
      ]
    }
  },
  methods: {
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
          deleteCustomsMasterById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsDeclarationRef'].handleTableClearCheckbox(true)
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
      const { contrNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: contrNo
      }
    },
    handleSplit(rows) {
      this.split = {
        visible: true,
        row: rows[0]
      }
    },
    handleGoodsDeclar(rows, declareType) {
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      if (declareType === enums.DECLARE_TYPE.getFieldByKey('GOODS_DECLARE')) {
        this.queryGoodsDeclar(rows, declareType)
      } else {
        this.$confirm('是否确认删除所选记录?', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        })
          .then(() => {
            this.queryGoodsDeclar(rows, declareType, enums.WHETHER_STATUS.getFieldByKey('YES'))
          })
          .catch(() => {
            this.queryGoodsDeclar(rows, declareType, enums.WHETHER_STATUS.getFieldByKey('NO'))
          })
      }
    },
    handleManifestChange(rows, type) {
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      this.manifestChange = {
        visible: true,
        type,
        row: { ids: rows.map(row => row.id) },
        title: type === 'change' ? '舱单变更申报' : '删除舱单'
      }
    },
    queryGoodsDeclar(rows, declareType, helpCommit) {
      goodsDeclareCustomsMaster({ ids: rows.map(row => row.id), declareType, helpCommit }).then(() => {
        this.$message.success('操作成功')
        this.reLoad()
      })
    },
    handleGoodsDeclarRollback(rows) {
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      goodsDeclareRollbackCustomsMaster({ ids: rows.map(row => row.id).join(',') }).then(() => {
        this.$message.success('操作成功')
        this.reLoad()
      })
    },
    handleManifestDeclare(rows) {
      if (!rows.every(row => row.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS'))) {
        return this.$message.error('请选择已审核的数据')
      }
      manifestDeclareCustomsMaster({ ids: rows.map(row => row.id).join(',') }).then(() => {
        this.$message.success('操作成功')
        this.reLoad()
      })
    },
    reLoad(isClearSelect) {
      this.$refs['customsDeclarationRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-declaration">
    <!-- 列表页 -->
    <base-page
      ref="customsDeclarationRef"
      :name="constant.TABLE_NAME_CUSTOMS_DECLARATION"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      :search-config="{
        labelWidth: '110px'
      }"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <split v-model="split.visible" :table-row="split.row" :re-load="reLoad"></split>
    <manifest-change
      v-model="manifestChange.visible"
      :table-row="manifestChange.row"
      :title="manifestChange.title"
      :type="manifestChange.type"
      :re-load="reLoad"
    />
  </div>
</template>
