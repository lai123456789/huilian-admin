<!-- B2B认证 -->
<script>
import { getCompanyCusAuth, deleteCompanyCusAuthById } from '@/api/company/company-cus-auth'
import { url as fileUrl } from '@/api/admin/sys-file'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { getDataDictionary } from '@/api/admin/dicts'
import Drawer from './components/drawer'
import { isFunction } from 'xe-utils'

export default {
  name: 'CusAuth',
  components: { Drawer },
  data() {
    const filePreviewStyle = { fontSize: 12, textDecoration: 'underline', color: '#409eff', cursor: 'pointer' }
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
        const { data } = await getCompanyCusAuth({ ...pager, ...transforArrayPayload(params) })
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
        {
          field: 'authStatus',
          title: '认证状态',
          color: value => {
            return enums.AUTH_STATUS.getFieldByValue(value, 'color')
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
              options: () => getDataDictionary(constant.DICTS_AUTH_STATUS)
            }
          }
        },
        { field: 'companyName', title: '公司名称', searchProps: true },
        { field: 'creditCode', title: '企业地址' },
        { field: 'phone', title: '手机号' },
        { field: 'email', title: '邮箱' },
        { field: 'companyAddress', title: '统一社会信用代码证' },
        { field: 'organizationCode', title: '组织机构代码' },
        { field: 'registerNo', title: '工商注册号' },
        { field: 'legalPerson', title: '法人股东名称' },
        {
          field: 'receiptFilePath1',
          title: '营业执照',
          width: 90,
          render: (h, value) => {
            return (
              <div style={filePreviewStyle} onClick={() => this.handleToFilePreview(value)}>
                {value ? '预览' : ''}
              </div>
            )
          }
        },
        {
          field: 'receiptFilePath2',
          title: '开户许可证',
          width: 90,
          render: (h, value) => {
            return (
              <div style={filePreviewStyle} onClick={() => this.handleToFilePreview(value)}>
                {value ? '预览' : ''}
              </div>
            )
          }
        },
        {
          field: 'receiptFilePath3',
          title: '法人身份证',
          width: 90,
          render: (h, value) => {
            return (
              <div style={filePreviewStyle} onClick={() => this.handleToFilePreview(value)}>
                {value ? '预览' : ''}
              </div>
            )
          }
        },
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
      show: this.permissions[constant.PERMISSION_CUS_AUTH],
      mark: constant.PERMISSION_CUS_AUTH
    }
    this.buttonsConfig = {
      del: {
        visible: this.permissions[constant.PERMISSION_CUS_AUTH_DEL],
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
          deleteCompanyCusAuthById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['cusAuthRef'].handleTableClearCheckbox(true)
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
      const { orderNo } = row
      this.tableRow = row
      this.details = {
        visible: true,
        title: orderNo
      }
    },
    handleToFilePreview(path) {
      if (!path) return
      window.open(`${fileUrl}/preView${path}`, '_blank')
    },
    reLoad(isClearSelect) {
      this.$refs['cusAuthRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="cus-auth">
    <!-- 列表页 -->
    <base-page
      ref="cusAuthRef"
      :name="constant.TABLE_NAME_CUS_AUTH"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
      @cell-dblclick="openDetails"
    />
    <drawer :visible.sync="details.visible" :title="details.title" :table-row="tableRow" :re-load="reLoad" :delete-fn="handleDel"></drawer>
  </div>
</template>
