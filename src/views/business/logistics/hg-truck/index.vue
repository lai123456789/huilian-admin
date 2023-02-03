<!-- 报关运输单 -->
<script>
import {
  getCustomsTransport,
  deleteCustomsTransportById,
  bindCustomsCustomsTransport,
  unBindCustomsCustomsTransport
} from '@/api/customs/customs-transport'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import HandleCustoms from './components/handle-customs'
import { isFunction } from 'xe-utils'

export default {
  name: 'CustomsTransport',
  components: { EnterForm, Drawer, HandleCustoms },
  data() {
    return {
      enums,
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      details: {
        visible: false,
        title: ''
      },
      customs: {
        visible: false,
        type: '',
        title: '',
        rows: []
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getCustomsTransport({ ...pager, ...transforArrayPayload(params) })
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
        { field: 'transportNo', title: '运输单号', searchProps: true },
        {
          field: 'trafStatus',
          title: '运输状态',
          searchProps: { type: 'select' },
          color: value => {
            return enums.TRAF_STATUS.getFieldByValue(value, 'color')
          },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRAF_STATUS)
            }
          }
        },
        {
          field: 'tradingType',
          title: '进出口标志',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IEF_LAG)
            }
          }
        },
        { field: 'trafModeName', title: '运输方式', searchProps: true },
        { field: 'transportDate', title: '运输日期', searchProps: { type: 'date' } },
        {
          field: 'outsourceFlag',
          title: '是否委外报关',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        {
          field: 'carpoolFlag',
          title: '是否拼车',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_WHETHER_STATUS)
            }
          }
        },
        {
          field: 'carType',
          title: '订车类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_HIRING_TAXIE_TYPE)
            }
          }
        },
        {
          field: 'carTrainNo',
          title: '车次类型',
          searchProps: { type: 'select' },
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_TRAIN_TYPE)
            }
          }
        },
        { field: 'entyPort', title: '出入境口岸' },
        { field: 'startWarehouseName', title: '始发仓', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: 'warehouse' } },
        { field: 'endWarehouseName', title: '目的仓', searchProps: true, link: { name: constant.ROUTE_WAREHOUSE, toField: 'warehouse' } },
        { field: 'expressName', title: '运输公司', searchProps: true, link: { name: constant.ROUTE_TRAN_DRIVER, toField: 'companyName' } },
        { field: 'plateNo', title: '车牌号码', searchProps: true },
        { field: 'person', title: '司机姓名', searchProps: true },
        { field: 'mobile', title: '司机电话' },
        { field: 'idCard', title: '身份证号' },
        { field: 'shipName', title: '船名' },
        { field: 'flightNo', title: '航班号' },
        { field: 'cargoListNo', title: '载货清单号/航次号', searchProps: true },
        { field: 'soNo', title: 'SO号' },
        { field: 'deliveryNo', title: '提单号' },
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
      show: this.permissions[constant.PERMISSION_HG_TRUCK],
      mark: constant.PERMISSION_HG_TRUCK
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_HG_TRUCK_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_HG_TRUCK_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_HG_TRUCK_DEL],
        handler: this.handleDel
      },
      mores: [
        {
          label: '绑定报关单',
          visible: this.permissions[constant.PERMISSION_HG_TRUCK_BIND_CUSTOMS],
          handler: row => this.handleCustoms(row, 'bind')
        },
        {
          label: '解绑报关单',
          visible: this.permissions[constant.PERMISSION_HG_TRUCK_UN_BIND_CUSTOMS],
          handler: row => this.handleCustoms(row, 'unBind')
        }
      ]
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
          deleteCustomsTransportById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsTransportRef'].handleTableClearCheckbox(true)
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
      const { transportNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: transportNo
      }
    },
    handleCustoms(rows, type) {
      this.customs = {
        visible: true,
        title: type === 'bind' ? '绑定报关单' : '解绑报关单',
        type,
        rows
      }
    },
    async handleHandleCustomsSave(data, done) {
      try {
        if (this.customs.type === 'bind') {
          await bindCustomsCustomsTransport({ id: this.customs.rows[0].id, customsMasterIds: data.map(v => v.id).join(',') })
        } else {
          await unBindCustomsCustomsTransport({ id: this.customs.rows[0].id, customsMasterIds: data.map(v => v.id).join(',') })
        }
        this.$message.success('操作成功')
        this.customs.visible = false
        done()
      } catch (error) {
        done()
      }
    },
    reLoad(isClearSelect) {
      this.$refs['customsTransportRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-transport">
    <!-- 列表页 -->
    <base-page
      ref="customsTransportRef"
      :name="constant.TABLE_NAME_HG_TRUCK"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
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
