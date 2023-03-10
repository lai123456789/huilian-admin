<script>
import {
  getCustomsMasterById,
  updateCustomsMaster,
  getCustomsMasterAuditList,
  auditCustomsMaster,
  goodsDeclareCustomsMaster,
  goodsDeclareRollbackCustomsMaster,
  manifestDeclareCustomsMaster
} from '@/api/customs/customs-master'
import { getSysReportByMenuMarkSysReportConfig } from '@/api/admin/sys-report-config'
import { publicValueSysPublicParamByPublicKey } from '@/api/admin/sys-public-param'
import { getDataDictionary } from '@/api/admin/dicts'
import constant from '@/constant'
import enums from '@/enums'
import BigNumber from '@/utils/big-number'
import { mapGetters } from 'vuex'
import { clone, isFunction } from 'xe-utils'
import DetailsMaster from './components/details-master'
import DetailsParticulars from './components/details-particulars'
import DetailsContainer from './components/details-container'
import DetailsDocument from './components/details-document'
import DetailsTotal from './components/details-total'
import MergeBill from './components/merge'
import UploadTaxNo from './components/upload-tax-no'
import UpdateEntryId from './components/update-entry-id'
import ManifestChange from './components/manifest-change'

export default {
  name: 'Details',
  components: {
    DetailsMaster,
    DetailsParticulars,
    DetailsContainer,
    DetailsDocument,
    DetailsTotal,
    MergeBill,
    UploadTaxNo,
    UpdateEntryId,
    ManifestChange
  },
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
    this.masterLicenseDocusForm = []
    return {
      constant,
      enums,
      loading: false,
      saveLoading: false,
      dicts: {},
      form: {
        auditStatus: void 0
      },
      createForm: {
        createByName: '',
        createTime: ''
      },
      rightLabelWidth: '70px',
      requestApi: {
        list: () => getCustomsMasterAuditList(this.tableRow.id),
        save: auditCustomsMaster
      },
      showBtns: {
        edit: false,
        del: false,
        mergeBill: false,
        upload: false,
        entryId: false,
        export: false
      },
      mergeBill: {
        visible: false
      },
      upload: {
        visible: false
      },
      entryId: {
        visible: false,
        row: {}
      },
      manifestChange: {
        visible: false,
        type: 'change',
        row: {},
        title: '??????????????????'
      },
      showAuditDetailsBtn: false,
      orderType: enums.IEF_LAG.getFieldByKey('IMPORT'),
      disabled: true,
      manifestOptions: [],
      customsOptions: [],
      businessExport: {
        visible: false,
        request: async () => {
          const { data } = await getSysReportByMenuMarkSysReportConfig({ menuMark: constant.PERMISSION_CUS_DECLAR_EXPORT })
          return {
            data
          }
        }
      },
      raw: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.showAuditDetailsBtn = this.permissions[constant.PERMISSION_CUS_DECLAR_AUDIT]
    this.customsOptions = [
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE],
        handler: () => this.handleGoodsDeclar(enums.DECLARE_TYPE.getFieldByKey('GOODS_DECLARE'))
      },
      {
        label: '????????????????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE_ONE],
        handler: () => this.handleGoodsDeclar(enums.DECLARE_TYPE.getFieldByKey('DECLARE_ONE'))
      },
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_DECLARE_BACK],
        handler: () => this.handleGoodsDeclarRollback()
      }
    ]
    this.manifestOptions = [
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST],
        handler: this.handleManifestDeclar
      },
      {
        label: '??????????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST_UPDATE],
        handler: () => this.handleManifestChange('change')
      },
      {
        label: '????????????',
        visible: this.permissions[constant.PERMISSION_CUS_DECLAR_MANIFEST_DEL],
        handler: () => this.handleManifestChange('delete')
      }
    ]
    this.getDetailsData()
  },
  methods: {
    // ??????????????????
    async getDetailsData(cb) {
      this.loading = true
      this.$nextTick(() => {
        const { DICTS_DECLARATION_STATUS, DICTS_WHETHER_STATUS, DICTS_ENTER_TYPE, DICTS_CUS_MARK_TYPE } = constant
        Promise.all([
          getDataDictionary([DICTS_DECLARATION_STATUS, DICTS_WHETHER_STATUS, DICTS_ENTER_TYPE, DICTS_CUS_MARK_TYPE]),
          getCustomsMasterById(this.tableRow.id),
          publicValueSysPublicParamByPublicKey(constant.PARAMS_CUSTOMS_QUALIF_PROMISE)
        ]).then(([dicts, info, customsQualifPromiseDefaultConfig]) => {
          const { auditStatus, iEFlag, createByName, createTime } = info.data
          this.dicts = dicts

          this.createForm = {
            createByName,
            createTime
          }

          Object.assign(this.form, {
            auditStatus
          })

          this.orderType = iEFlag

          this.showBtns = {
            edit: this.permissions[constant.PERMISSION_CUS_DECLAR_EDIT],
            del: this.permissions[constant.PERMISSION_CUS_DECLAR_DEL],
            mergeBill: this.permissions[constant.PERMISSION_CUS_DECLAR_MERGE],
            upload: this.permissions[constant.PERMISSION_CUS_DECLAR_UPLOAD],
            entryId: this.permissions[constant.PERMISSION_CUS_DECLAR_ENTER_ID],
            export: this.permissions[constant.PERMISSION_CUS_DECLAR_EXPORT]
          }

          const defaultConfig = {
            customsQualifPromise: customsQualifPromiseDefaultConfig.data || {}
          }

          this.$nextTick(async () => {
            this.$refs.detailsMasteRef.setData(info.data, this.dicts, defaultConfig)
            this.$refs.detailsParticularsRef.setData(info.data, this.dicts, defaultConfig)
            this.$refs.detailsContainerRef.setData(info.data, this.dicts)
            this.$refs.detailsDocumentRef.setData(info.data, this.dicts)
            this.raw = info.data

            if (isFunction(cb)) cb()
            this.loading = false
          })
        })
      })
    },
    handleDocRecords(data) {
      this.masterLicenseDocusForm = data
    },
    // ??????
    handleSummary(records) {
      let gQtys = 0
      let customsTotal = 0
      let firstQtys = 0
      let secondQtys = 0
      records.forEach(row => {
        gQtys = new BigNumber(gQtys).plus(Number(row.gQty)).toNumber()
        customsTotal = new BigNumber(customsTotal).plus(Number(row.customsTotal)).toNumber()
        firstQtys = new BigNumber(firstQtys).plus(Number(row.firstQty)).toNumber()
        secondQtys = new BigNumber(secondQtys).plus(Number(row.secondQty)).toNumber()
      })

      this.$refs.detailsTotalRef.setData({
        gQtys: new BigNumber(gQtys).toFormat(),
        customsTotal: new BigNumber(customsTotal).toFormat(),
        firstQtys: new BigNumber(firstQtys).toFormat(),
        secondQtys: new BigNumber(secondQtys).toFormat()
      })
    },
    handleMergeBill() {
      this.mergeBill.visible = true
    },
    handleUpload() {
      this.upload.visible = true
    },
    handleEntryId() {
      this.entryId = {
        visible: true,
        row: this.$refs.detailsMasteRef.form
      }
    },
    handleGoodsDeclar(declareType) {
      if (declareType === enums.DECLARE_TYPE.getFieldByKey('GOODS_DECLARE')) {
        this.queryGoodsDeclar(this.tableRow, declareType)
      } else {
        this.$confirm('???????????????????????????????', '??????', {
          confirmButtonText: '???',
          cancelButtonText: '???',
          type: 'warning'
        })
          .then(() => {
            this.queryGoodsDeclar(this.tableRow, declareType, enums.WHETHER_STATUS.getFieldByKey('YES'))
          })
          .catch(() => {
            this.queryGoodsDeclar(this.tableRow, declareType, enums.WHETHER_STATUS.getFieldByKey('NO'))
          })
      }
    },
    handleManifestChange(type) {
      this.manifestChange = {
        visible: true,
        type,
        row: { ids: [this.tableRow.id] },
        title: type === 'change' ? '??????????????????' : '????????????'
      }
    },
    queryGoodsDeclar(row, declareType, helpCommit) {
      goodsDeclareCustomsMaster({ ids: [row.id], declareType, helpCommit }).then(() => {
        this.handleUpdateInfoReload(() => {
          this.$message.success('????????????')
        })
      })
    },
    handleGoodsDeclarRollback() {
      goodsDeclareRollbackCustomsMaster({ ids: this.tableRow.id }).then(() => {
        this.handleUpdateInfoReload(() => {
          this.$message.success('????????????')
        })
      })
    },
    handleManifestDeclar() {
      manifestDeclareCustomsMaster({ ids: this.tableRow.id }).then(() => {
        this.handleUpdateInfoReload(() => {
          this.$message.success('????????????')
        })
      })
    },
    handleExport() {
      this.businessExport.visible = true
    },
    handleEdit() {
      this.disabled = false
    },
    handleSave() {
      this.saveLoading = true
      this.$refs.detailsMasteRef.getFormInstance().validate((valid, invalidFields) => {
        if (valid) {
          const detailsParticularRecords = this.$refs.detailsParticularsRef.getVxeGridInstance().getVxeGridInstance().getRecords()
          const detailsContainerRecords = this.$refs.detailsContainerRef.getVxeGridInstance().getVxeGridInstance().getRecords()
          const detailsMasteForm = clone(this.$refs.detailsMasteRef.form, true)
          const customsMasterDetailDTOList = (detailsParticularRecords || []).map((v, index) => ({
            ...v,
            // ????????????????????????????????????????????????????????????????????????????????????????????????????????????
            gNo: index + 1,
            customsMasterDetailElementDTOList: v.customsMasterDetailElementVOList
          }))

          const customsMasterLicenseDocusDTOList = this.masterLicenseDocusForm || []
          const customsMasterUserDTOList = detailsMasteForm.customsMasterUserVOList || []
          const customsMasterQualifs = detailsMasteForm.customsMasterQualificationsList
          const customsMasterCopLimitDTOList = customsMasterQualifs
            ? detailsMasteForm.declaratioMaterialCommitment // ???????????????????????????????????????
              ? customsMasterQualifs.slice(0, customsMasterQualifs.length - 1) // ??????????????????
              : customsMasterQualifs
            : []
          const customsNameDeclarElementDTOList = detailsMasteForm.classifyElements || []
          const customsTransportContainerDTOList = detailsContainerRecords
          const formData = Object.assign(
            detailsMasteForm,
            {
              customsMasterDetailDTOList,
              customsMasterLicenseDocusDTOList,
              customsMasterUserDTOList,
              customsMasterCopLimitDTOList,
              customsNameDeclarElementDTOList,
              customsTransportContainerDTOList
            },
            {
              feeRate:
                detailsMasteForm.feeMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(detailsMasteForm.feeRate).div(100).toNumber()
                  : detailsMasteForm.feeRate,
              insurRate:
                detailsMasteForm.insurMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(detailsMasteForm.insurRate).div(100).toNumber()
                  : detailsMasteForm.insurRate,
              otherRate:
                detailsMasteForm.otherMark === enums.CUS_MARK_TYPE.getFieldByKey('RATE')
                  ? new BigNumber(detailsMasteForm.otherRate).div(100).toNumber()
                  : detailsMasteForm.otherRate
            }
          )
          updateCustomsMaster(formData)
            .then(() => {
              this.handleUpdateInfoReload()
              this.$message.success('????????????')
              this.saveLoading = false
              this.disabled = true
            })
            .catch(() => {
              this.saveLoading = false
            })
        } else {
          // ?????? el-message ???????????????????????????
          this.$refs.detailsMasteRef.getFormInstance().useErrorByMessage(invalidFields)
          this.saveLoading = false
        }
      })
    },
    handleCancel() {
      this.$nextTick(() => {
        this.$refs.detailsMasteRef.setData(this.raw, this.dicts, {})
        this.$refs.detailsParticularsRef.setData(this.raw, this.dicts, {})
        this.$refs.detailsContainerRef.setData(this.raw, this.dicts)
        this.$refs.detailsDocumentRef.setData(this.raw, this.dicts)
      })
      this.disabled = true
    },
    handleDelete() {
      this.deleteFn()
    },
    handleAuditSave(closeDialog) {
      this.handleUpdateInfoReload(() => {
        closeDialog()
      })
    },
    // ????????????????????????????????????????????????
    handleUpdateInfoReload(cb) {
      this.getDetailsData(cb)
      this.reLoad(true)
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="common-operate customs-declaration"
    element-loading-text="???????????????"
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
          <div class="customs-declaration-l">
            <div class="customs-declaration-master">
              <details-master ref="detailsMasteRef" :disabled="disabled" :order-type="orderType" />
            </div>
            <div class="customs-declaration-particulars">
              <details-particulars
                ref="detailsParticularsRef"
                :disabled="disabled"
                :table-row="tableRow"
                :order-type="orderType"
                :re-load="handleUpdateInfoReload"
                :handle-summary="handleSummary"
              />
            </div>
          </div>
          <div class="customs-declaration-r">
            <div class="customs-declaration-container">
              <details-container ref="detailsContainerRef" :table-row="tableRow" :disabled="disabled" :order-type="orderType" />
            </div>
            <div class="customs-declaration-document">
              <details-document ref="detailsDocumentRef" :disabled="disabled" @get-doc-records="handleDocRecords" />
            </div>
            <div class="customs-declaration-total">
              <details-total ref="detailsTotalRef" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-operate-b">
      <div class="common-operate-b-wrap">
        <template v-if="disabled">
          <business-dropdown-button v-if="form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')" :options="customsOptions"
            >???????????????</business-dropdown-button
          >
          <business-dropdown-button v-if="form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')" :options="manifestOptions"
            >????????????</business-dropdown-button
          >
          <el-button
            v-if="showBtns.entryId && form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')"
            type="warning"
            icon="el-icon-s-operation"
            @click="handleEntryId"
            >??????????????????</el-button
          >
          <el-button
            v-if="
              showBtns.upload &&
              orderType === enums.IEF_LAG.getFieldByKey('IMPORT') &&
              form.auditStatus === enums.AUDIT_STATUS.getFieldByKey('PASS')
            "
            type="primary"
            icon="el-icon-s-operation"
            @click="handleUpload"
            >????????????</el-button
          >
          <el-button
            v-if="showBtns.mergeBill && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
            type="primary"
            icon="el-icon-s-operation"
            @click="handleMergeBill"
            >??????</el-button
          >
          <el-button v-if="showBtns.export" icon="el-icon-download" type="info" @click="handleExport">??????</el-button>
          <el-button
            v-if="showBtns.del && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
            icon="el-icon-delete"
            type="danger"
            @click="handleDelete"
            >??????</el-button
          >
          <el-button
            v-if="showBtns.edit && form.auditStatus !== enums.AUDIT_STATUS.getFieldByKey('PASS')"
            icon="el-icon-edit"
            type="warning"
            @click="handleEdit"
            >??????</el-button
          >
        </template>
        <template v-else>
          <el-button type="primary" :loading="saveLoading" icon="el-icon-check" @click="handleSave">??????</el-button>
          <el-button icon="el-icon-close" @click="handleCancel">??????</el-button>
        </template>
      </div>
    </div>
    <business-export v-model="businessExport.visible" :request="businessExport.request" :table-rows="[raw]" />
    <merge-bill v-model="mergeBill.visible" :table-row="tableRow" :re-load="handleUpdateInfoReload" />
    <upload-tax-no v-model="upload.visible" :table-row="tableRow" :re-load="handleUpdateInfoReload" />
    <update-entry-id v-model="entryId.visible" :table-row="entryId.row" :re-load="handleUpdateInfoReload" />
    <manifest-change
      v-model="manifestChange.visible"
      :table-row="manifestChange.row"
      :title="manifestChange.title"
      :type="manifestChange.type"
      :re-load="handleUpdateInfoReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.customs-declaration {
  .common-operate-l {
    overflow: inherit;
    width: 100%;
    &-audit {
      padding: 3px;
    }
    &-main {
      overflow: auto;
    }
  }
  &-l {
    display: inline-block;
    padding: 0 3px 3px 3px;
    width: 77.4%;
    vertical-align: top;
  }
  &-r {
    display: inline-block;
    width: 22.6%;
    vertical-align: top;
  }
}
</style>
