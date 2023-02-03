<script>
import { getCompanyCusAuthById, getCompanyCusAuthAuditList, auditCompanyCusAuth } from '@/api/company/company-cus-auth'
import { url as fileUrl } from '@/api/admin/sys-file'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import { mapGetters } from 'vuex'
import { isFunction } from 'xe-utils'

export default {
  name: 'Details',
  props: {
    tableRow: {
      type: Object,
      default: () => ({})
    },
    deleteFn: {
      type: Function,
      default: () => () => {}
    },
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
      form: {
        id: 0,
        auditStatus: void 0,
        companyName: '',
        companyAddress: '',
        phone: '',
        creditCode: '',
        organizationCode: '',
        registerNo: '',
        legalPerson: '',
        receiptFilePath1: '',
        receiptFilePath2: '',
        receiptFilePath3: ''
      },
      enterForm: {
        visible: false,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      statusForm: {
        authStatus: ''
      },
      showBtns: {
        del: false
      },
      dicts: {},
      rightLabelWidth: '70px',
      requestApi: {
        list: () => getCompanyCusAuthAuditList(this.tableRow.id),
        save: auditCompanyCusAuth
      },
      showAuditDetailsBtn: false
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_WARE_RECEIVE_AUDIT]
    this.getDetailsData()
  },
  methods: {
    // 获取详情数据
    async getDetailsData(cb) {
      this.$nextTick(() => {
        this.loading = true
        Promise.all([getDataDictionary([]), getCompanyCusAuthById(this.tableRow.id)]).then(([dicts, info]) => {
          const { authStatus, createByName, createTime } = info.data
          this.dicts = dicts

          this.statusForm = {
            authStatus
          }

          this.createForm = {
            createByName,
            createTime
          }
          Object.assign(this.form, info.data)

          this.showBtns = {
            del: this.permissions[constant.PERMISSION_CUS_AUTH_DEL]
          }

          if (isFunction(cb)) cb()
          this.loading = false
        })
      })
    },
    handleToFilePreview(path) {
      if (!path) return
      window.open(`${fileUrl}/preView${path}`, '_blank')
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
    },
    // 修改某一项时，刷新列表页和详情页
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
    class="common-operate cus-auth is-details-adaptive"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="common-operate-t">
      <div class="common-operate-l">
        <div class="common-operate-l-audit">
          <business-audit-bar
            ref="auditBarRef"
            :audit-status="form.auditStatus"
            :business-id="tableRow.id"
            :request-api="requestApi"
            :show-details="showAuditDetailsBtn"
            @save="handleAuditSave"
          ></business-audit-bar>
        </div>
        <div class="common-operate-l-main">
          <base-form ref="formRef" :model="form" label-width="120px" size="mini">
            <!-- 基本信息 -->
            <div class="common-operate-block">
              <span class="common-operate-block-header">
                <i class="icon el-icon-s-grid"></i>
                基本信息
              </span>
              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item label="企业名称" prop="companyName">
                    <base-input v-model="form.companyName" disabled placeholder="请输入企业名称" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="企业地址" prop="companyAddress">
                    <base-input v-model="form.companyAddress" disabled placeholder="请输入企业地址" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="手机号" prop="phone">
                    <base-input v-model="form.phone" disabled placeholder="请输入手机号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="统一社会信用代码" prop="creditCode">
                    <base-input v-model="form.creditCode" disabled placeholder="请输入统一社会信用代码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="组织机构代码" prop="organizationCode">
                    <base-input v-model="form.organizationCode" disabled placeholder="请输入组织机构代码" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="工商注册号" prop="registerNo">
                    <base-input v-model="form.registerNo" disabled placeholder="请输入工商注册号" />
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item label="法人股东名称" prop="legalPerson">
                    <base-input v-model="form.legalPerson" disabled placeholder="请输入法人股东名称" />
                  </base-form-item>
                </base-col>
              </base-row>

              <base-row :gutter="10">
                <base-col :span="6">
                  <base-form-item class="file-content" label="营业执照" prop="receiptFilePath1">
                    <div v-if="form.receiptFilePath1" class="file-content-item" @click="handleToFilePreview(form.receiptFilePath1)">
                      预览
                    </div>
                    <div v-else class="no-file-content">-</div>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item class="file-content" label="开户许可证" prop="receiptFilePath2">
                    <div v-if="form.receiptFilePath2" class="file-content-item" @click="handleToFilePreview(form.receiptFilePath2)">
                      预览
                    </div>
                    <div v-else class="no-file-content">-</div>
                  </base-form-item>
                </base-col>

                <base-col :span="6">
                  <base-form-item class="file-content" label="法人身份证" prop="receiptFilePath3">
                    <div v-if="form.receiptFilePath3" class="file-content-item" @click="handleToFilePreview(form.receiptFilePath3)">
                      预览
                    </div>
                    <div v-else class="no-file-content">-</div>
                  </base-form-item>
                </base-col>
              </base-row>
            </div>
          </base-form>
        </div>
      </div>
      <div class="common-operate-r">
        <div class="common-operate-r-block">
          <el-divider content-position="left">状态</el-divider>

          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">认证状态:</div>
            <div class="dcommon-etails-r-value" :style="{ color: enums.AUTH_STATUS.getFieldByValue(statusForm.authStatus, 'color') }">
              {{ enums.AUTH_STATUS.getFieldByValue(statusForm.authStatus) }}
            </div>
          </div>
        </div>
        <div class="common-operate-r-block">
          <el-divider content-position="left">创建信息</el-divider>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建人:</div>
            <div class="dcommon-etails-r-value">{{ createForm.createByName }}</div>
          </div>
          <div class="common-operate-r-item">
            <div class="common-operate-r-label" :style="{ width: rightLabelWidth }">创建时间:</div>
            <div class="common-operate-r-value">{{ createForm.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <el-button
          v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
          icon="el-icon-delete"
          type="danger"
          @click="handleDelete"
          >删除</el-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cus-auth {
  .common-operate-l {
    overflow: inherit;
    width: calc(100% - 240px);
    &-audit {
      padding: 10px 10px 0 10px;
    }
    &-main {
      overflow: auto;
    }
  }
  .common-operate-block-body {
    min-height: 250px;
  }
  .common-operate-block {
    &.is-special {
      .common-operate-block-header {
        margin-bottom: 0;
      }
    }
  }
  .file-content-item {
    display: inline-block;
    font-size: 14px;
    text-decoration: underline;
    color: #409eff;
    cursor: pointer;
  }
  .no-file-content {
    font-size: 12px;
    text-decoration: none;
  }
}
</style>
