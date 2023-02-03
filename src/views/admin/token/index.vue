<!-- 令牌管理 -->
<script>
import { getToken, deleteTokenByToken } from '@/api/admin/token'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'Token',
  data() {
    return {
      constant,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getToken({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        { field: 'client_id', title: '客户端' },
        { field: 'username', title: '用户名', searchProps: true },
        { field: 'access_token', title: '令牌' },
        { field: 'refresh_token', title: '刷新令牌' },
        { field: 'token_type', title: '类型' },
        { field: 'scope', title: '范围' },
        { field: 'expires_in', title: '过期时间' }
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
      show: this.permissions[constant.PERMISSION_SYS_TOKEN],
      mark: constant.PERMISSION_SYS_TOKEN
    }
    this.buttonsConfig = {
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_TOKEN_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteTokenByToken(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['tokenRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    openErrorDetails(row) {
      this.exception = row.exception
      this.visible = true
    },
    reLoad(isClearSelect) {
      this.$refs['tokenRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <div class="token">
    <!-- 列表页 -->
    <base-page
      ref="tokenRef"
      :name="constant.TABLE_NAME_SYS_TOKEN"
      :columns="columns"
      :request="request"
      :help-config="helpConfig"
      :buttons-config="buttonsConfig"
    />
  </div>
</template>
