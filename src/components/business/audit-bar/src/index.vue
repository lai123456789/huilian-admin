<script>
import { clone } from 'xe-utils'
import enums from '@/enums'
import AuditList from './audit-list'

const auditFlags = [
  { label: '同意', value: '0' },
  { label: '驳回', value: '1' },
  { label: '重启', value: '2' }
]

export default {
  name: 'BusinessAuditBar',
  components: { AuditList },
  props: {
    auditStatus: String,
    businessId: String,
    showDetails: {
      type: Boolean,
      default: false
    },
    requestApi: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      config: {
        [enums.AUDIT_STATUS.getFieldByKey('WAIT')]: {
          icon: 'audit-wait',
          message: '当前记录尚未提交审批',
          color: enums.AUDIT_STATUS.getFieldByKey('WAIT', 'color')
        },
        [enums.AUDIT_STATUS.getFieldByKey('IS')]: {
          icon: 'audit-is',
          message: '当前记录正在审批中',
          color: enums.AUDIT_STATUS.getFieldByKey('IS', 'color')
        },
        [enums.AUDIT_STATUS.getFieldByKey('PASS')]: {
          icon: 'audit-pass',
          message: '当前记录已审批完成',
          color: enums.AUDIT_STATUS.getFieldByKey('PASS', 'color')
        },
        [enums.AUDIT_STATUS.getFieldByKey('REJECT')]: {
          icon: 'audit-reject',
          message: '当前记录审批已被驳回',
          color: enums.AUDIT_STATUS.getFieldByKey('REJECT', 'color')
        }
      },
      auditFlags: clone(auditFlags, true),
      loading: true,
      visible: false,
      isApprovaled: false,
      formAudits: [],
      audits: []
    }
  },
  methods: {
    // 获取审核列表
    getAudits() {
      this.loading = true
      this.formAudits = []
      this.audits = []
      return this.requestApi.list().then(res => {
        const audits = res.data || []

        // 获取最新流程的流程实例id(数组第一条)
        this.processInstanceId = audits[0].processInstanceId

        // 获取数组第一项，审批流程是否已经审批完成
        if (audits[0].type !== 'task') {
          this.auditFlags = [{ label: '重启', value: '2' }]
          this.formAudits = [{ ...Object.assign({ ...audits[0] }, { auditFlag: void 0, taskId: '', comment: '', active: void 0 }) }]
          this.isApprovaled = false
        } else {
          this.auditFlags = clone(auditFlags, true)
          this.isApprovaled = true
        }
        audits.forEach(audit => {
          // 如果是当前类型为代办任务，则放在form数组里
          if (audit.type === 'task') {
            this.formAudits.push(Object.assign({ auditFlag: void 0, comment: '', active: void 0 }, audit))
          } else {
            this.audits.push(audit)
          }
        })
        this.loading = false
      })
    },
    // handleClick() {},
    handleDetails() {
      this.visible = true
      this.getAudits()
    },
    handleSave(done) {
      const formAudits = this.formAudits

      // 判断至少填写一条代办任务
      const audits = formAudits.filter(v => v.auditFlag)
      if (audits.length === 0) {
        done()
        return this.$message.warning('请选择其中一条审批任务中的审批选项')
        // TODO 后台不支持审核多条任务
      } else if (audits.length > 1) {
        done()
        return this.$message.warning('只能操作一条审批任务')
      } else if (audits.length === 1) {
        const { auditFlag, comment, taskId } = audits[0]

        const taskSubmitDTO = {
          activityId: '',
          auditFlag,
          businessId: this.businessId,
          comment,
          taskId
        }

        const submitData = () => {
          this.requestApi
            .save(taskSubmitDTO)
            .then(() => {
              done()
              const closeDialog = () => {
                this.$message.success('审核成功')
                this.visible = false
              }
              this.$emit('save', closeDialog)
            })
            .catch(() => {
              done()
            })
        }

        /** 同意 */
        if (auditFlag === '0') {
          submitData()
          /** 驳回 */
        } else if (auditFlag === '1') {
          submitData()
          /** 重启 */
        } else if (auditFlag === '2') {
          // 如果是重启需要弹出一个确认框
          this.$confirm('重启会使审批流程回到初始节点，是否确认?')
            .then(() => {
              submitData()
            })
            .catch(() => {
              done()
            })
        }
      }
    }
  }
}
</script>

<template>
  <div class="business-audit-bar">
    <div v-if="config[auditStatus]" class="business-audit-bar-main" :style="{ backgroundColor: config[auditStatus].color }">
      <div class="business-audit-bar-icon">
        <base-svg-icon :icon-class="config[auditStatus].icon" />
      </div>
      <div class="business-audit-bar-message">{{ config[auditStatus].message }}</div>
      <div class="business-audit-bar-btns">
        <!-- <el-button v-for="auditFlag in auditFlags" :key="auditFlag.value" size="mini" @click="handleClick(audit, auditFlag.value)">
          {{ auditFlag.label }}
        </el-button> -->
        <el-button v-if="showDetails" size="mini" @click="handleDetails">详情</el-button>
      </div>
    </div>
    <base-dialog :visible.sync="visible" width="1000px" title="审核" @save="handleSave">
      <audit-list
        :audit-flags="auditFlags"
        :loading="loading"
        :audits="audits"
        :form-audits="formAudits"
        :is-approvaled="isApprovaled"
      ></audit-list>
    </base-dialog>
  </div>
</template>

<style lang="scss" scoped>
.business-audit-bar {
  &-main {
    display: flex;
    align-items: center;
    padding-right: 10px;
    border: 1px solid transparent;
    border-radius: 2px;
    color: #ffffff;
  }
  &-icon {
    width: 55px;
    font-size: 24px;
    text-align: center;
  }
  &-message {
    flex: 1;
    padding: 10px 10px 10px 0;
    font-size: 13px;
  }
}
</style>
