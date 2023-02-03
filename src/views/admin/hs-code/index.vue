<!-- 海关编码 -->
<script>
import { getBaseCustomsCode, deleteBaseCustomsCodeById } from '@/api/base/base-customs-code'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import BigNumber from '@/utils/big-number'
import EnterForm from './components/enter-form'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'CustomsCode',
  components: { EnterForm, Drawer },
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
        const { data } = await getBaseCustomsCode({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'productCode', title: '商品编码', searchProps: true },
        { field: 'productName', title: '商品名称', searchProps: true },
        { field: 'firstUnit', title: '第一法定单位' },
        { field: 'secondUnit', title: '第二法定单位' },
        {
          field: 'exRate',
          title: '出口税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exRebateRate',
          title: '出口退税税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exTentativeRate',
          title: '出口暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'vatRate',
          title: '增值税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'preferentialRate',
          title: '最惠国税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imTentativeRate',
          title: '进口暂定税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'imGeneralRate',
          title: '进口普通税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        },
        {
          field: 'exciseRate',
          title: '消费税率(%)',
          formatter: value => {
            return new BigNumber(Number(value)).times(100).toNumber()
          }
        }
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
      show: this.permissions[constant.PERMISSION_BASE_HS_CODE],
      mark: constant.PERMISSION_BASE_HS_CODE
    }
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_BASE_HS_CODE_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_BASE_HS_CODE_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_BASE_HS_CODE_DEL],
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
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row, cb) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteBaseCustomsCodeById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['customsCodeRef'].handleTableClearCheckbox(true)
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
      const { productCode } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: productCode
      }
    },
    reLoad(isClearSelect) {
      this.$refs['customsCodeRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="customs-code">
    <!-- 列表页 -->
    <base-page
      ref="customsCodeRef"
      :name="constant.TABLE_NAME_BASE_HS_CODE"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
    <enter-form ref="enterFormRef" v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </div>
</template>
