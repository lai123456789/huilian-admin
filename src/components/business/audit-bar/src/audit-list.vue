<script>
import { isEmpty } from 'xe-utils'
import variables from '@/styles/variables.scss'
import { getStorage } from '@/utils/storage'
import constant from '@/constant'

export default {
  name: 'AuditList',
  props: {
    loading: Boolean,
    auditFlags: {
      type: Array,
      default: () => []
    },
    formAudits: {
      type: Array,
      default: () => []
    },
    audits: {
      type: Array,
      default: () => []
    },
    isApprovaled: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      visibleFlow: false,
      loadedProcess: false,
      actPicUrl: ''
    }
  },
  methods: {
    transformStatus(status) {
      let obj = {}
      switch (status) {
        // 同意
        case 'agree':
          obj = { text: '同意', type: 'success', color: variables.successColor }
          break
        // 驳回
        case 'reject':
          obj = { text: '驳回', type: 'error', color: variables.dangerColor }
          break
        // 重启
        case 'start':
          obj = { text: '重启', type: 'primary', color: variables.themeColor }
          break
        // 代办任务
        case 'task':
          obj = { text: '代办任务', type: 'info', color: variables.infoColor }
          break
      }
      return obj
    },
    isCurrentAuditUser(userNames) {
      const userInfo = getStorage({ name: constant.STORAGE_USER_INFO })
      if (!isEmpty(userInfo)) {
        const { username } = userInfo
        return userNames.length > 0 && userNames.includes(username)
      }
      return false
    },
    handleClickAuditFlag(oAudit, value, index) {
      if (oAudit.active === index) {
        oAudit.active = void 0
        oAudit.auditFlag = void 0
      } else {
        oAudit.auditFlag = value
        oAudit.active = index
      }
    },
    handleClickFlowChart() {
      this.actPicUrl = ''
      this.loadedProcess = false
      this.actPicUrl = `/act/process/resource/${this.processInstanceId}/image`
      this.visibleFlow = true
    },
    handleLoadedProcess() {
      this.loadedProcess = true
    }
  }
}
</script>

<!-- 审核弹窗 -->
<template>
  <div class="audit">
    <div v-if="!loading" class="audit-node-wrap">
      <el-timeline>
        <el-timeline-item placement="top">
          <div @click="handleClickFlowChart">
            <el-alert title="审核流程图" class="first-node" type="info" description="点击查看审批流程图" :closable="false" show-icon />
          </div>
        </el-timeline-item>
        <!-- 这里是流程全部走完之后 -->
        <template v-if="!isApprovaled">
          <template v-for="audit in formAudits">
            <el-timeline-item :key="`formAudit_${audit.taskId}`" placement="top">
              <div class="form-ouline">
                <el-form label-width="100px" label-suffix="：" size="mini">
                  <div class="audit-alert-success">
                    <el-alert type="success" title="审批流程已结束,是否需要重启该流程" :closable="false" show-icon />
                  </div>
                  <el-form-item label="审批选项">
                    <div class="button-group">
                      <div
                        v-for="(auditFlag, index) in auditFlags"
                        :key="`auditFlag_${auditFlag.value}`"
                        :class="['button-item', { 'is-active': audit.active === index }]"
                        @click="handleClickAuditFlag(audit, auditFlag.value, index)"
                      >
                        {{ auditFlag.label }}
                      </div>
                    </div>
                  </el-form-item>
                  <!-- 审批选项为重启才显示审批意见 -->
                  <el-form-item v-if="audit.auditFlag === '2'" label="审批意见">
                    <el-input v-model="audit.comment" type="textarea" :autosize="{ minRows: 2 }" placeholder="请输入审批意见"></el-input>
                  </el-form-item>
                </el-form>
              </div>
            </el-timeline-item>
          </template>
        </template>
        <!-- 这里是还有流程审批 -->
        <template v-else>
          <template v-for="audit in formAudits">
            <el-timeline-item :key="`formAudit_${audit.taskId}`" placement="top">
              <div class="form-ouline">
                <el-form label-width="110px" label-suffix="：" size="mini">
                  <el-form-item label="任务名称" class="audit-form-item">
                    <span class="label-content">{{ audit.taskName }}</span>
                  </el-form-item>
                  <el-form-item label="任务描述" class="audit-form-item">
                    <span class="label-content">{{ audit.taskDescription }}</span>
                  </el-form-item>
                  <el-form-item label="审批候选组" class="audit-form-item">
                    <template v-if="audit.groupName.length > 0">
                      <div v-for="candidate in audit.groupName" :key="candidate" class="label-content candidate">
                        <i class="el-icon-s-opportunity candidate-icon"></i>
                        <span class="candidate-text">{{ candidate }}</span>
                      </div>
                    </template>
                    <span v-else class="label-content">无</span>
                  </el-form-item>
                  <el-form-item label="审批候选人" class="audit-form-item">
                    <div v-for="realName in audit.realName" :key="realName" class="label-content candidate">
                      <i class="el-icon-user-solid candidate-icon"></i>
                      <span class="candidate-text">{{ realName }}</span>
                    </div>
                  </el-form-item>
                  <!-- 如果当前登录人在这个候选名单中，则显示下面的审批选项和审批意见，否则不显示 -->
                  <template v-if="isCurrentAuditUser(audit.userName)">
                    <el-form-item label="审批选项">
                      <div class="button-group">
                        <div
                          v-for="(auditFlag, index) in auditFlags"
                          :key="`auditFlag_${auditFlag.value}`"
                          :class="['button-item', { 'is-active': audit.active === index }]"
                          @click="handleClickAuditFlag(audit, auditFlag.value, index)"
                        >
                          {{ auditFlag.label }}
                        </div>
                      </div>
                    </el-form-item>
                    <el-form-item label="审批意见">
                      <el-input v-model="audit.comment" type="textarea" :autosize="{ minRows: 2 }" placeholder="请输入审批意见"></el-input>
                    </el-form-item>
                  </template>
                </el-form>
              </div>
            </el-timeline-item>
          </template>
        </template>
        <template v-for="audit in audits">
          <el-timeline-item :key="`audit_${audit.id}`" :timestamp="audit.time" placement="top" :color="transformStatus(audit.type).color">
            <template v-if="audit.type !== 'start'">
              <el-alert :type="transformStatus(audit.type).type" :closable="false" show-icon>
                <span slot="title">{{ audit.taskName }}：{{ audit.userId }}</span>
                <p class="alert-description-row">
                  <span class="alert-description-label">任务描述：</span>
                  <span class="alert-description-value">{{ audit.taskDescription }}</span>
                </p>
                <p class="alert-description-row">
                  <span class="alert-description-label">审批选项：</span>
                  <span class="alert-description-value">{{ transformStatus(audit.type).text }}</span>
                </p>
                <p class="alert-description-row">
                  <span class="alert-description-label">审批意见：</span>
                  <span class="alert-description-value">{{ audit.fullMessage }}</span>
                </p>
              </el-alert>
            </template>
            <template v-else>
              <el-alert type="primary" :title="audit.fullMessage" :closable="false" show-icon />
            </template>
          </el-timeline-item>
        </template>
      </el-timeline>
      <!-- 流程图 -->
      <base-dialog :visible.sync="visibleFlow" title="流程图" width="70%" :show-footer="false">
        <img v-show="loadedProcess" class="audit-process-img" :src="actPicUrl" @load="handleLoadedProcess" />
        <div
          v-if="!loadedProcess"
          v-loading="!loadedProcess"
          class="audit-process-loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
        ></div>
      </base-dialog>
    </div>
    <div
      v-else
      v-loading="loading"
      class="audit-loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.audit {
  padding-left: 10px;
  text-align: initial;
  .first-node {
    cursor: pointer;
  }
  .form-ouline {
    padding: 20px 20px 5px 5px;
    border: 2px dashed #e7e7e7;
    border-radius: 5px;
  }
  .alert-description-row {
    display: flex;
    margin-bottom: 5px;
    .alert-description-label {
      width: 60px;
    }
    .alert-description-value {
      flex: 1;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  & ::v-deep .el-alert--primary.is-light {
    color: var(--color-primary);
    background-color: var(--color-light-primary);
  }
  .candidate {
    display: inline-block;
    &-text {
      padding: 0 15px 0 3px;
    }
  }
  .audit-alert-success {
    margin-bottom: 15px;
    padding-left: 15px;
  }
  .audit-form-item {
    margin-bottom: 13px !important;
    .label-content {
      display: inline-block;
      line-height: normal;
      padding-top: 5px;
    }
  }
  .button-group {
    display: inline-block;
    line-height: 1;
    vertical-align: middle;
    font-size: 0;
    .button-item {
      position: relative;
      display: inline-block;
      margin: 0;
      padding: 9px 15px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #dcdfe6;
      border-left: 0;
      border-radius: 0;
      text-align: center;
      white-space: nowrap;
      color: #606266;
      background: #ffffff;
      outline: none;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      line-height: 1;
      vertical-align: middle;
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;
      &:first-child {
        border-left: 1px solid #dcdfe6;
        border-radius: 4px 0 0 4px;
        box-shadow: none !important;
      }
      &:last-child {
        border-radius: 0 4px 4px 0;
        box-shadow: none !important;
      }
      &.is-active {
        border-color: var(--color-primary);
        color: #ffffff;
        background-color: var(--color-primary);
      }
    }
  }
  &-process-img {
    width: 100%;
  }
  &-process-loading {
    height: 480px;
  }
  &-loading {
    height: 66vh;
  }
}
</style>
