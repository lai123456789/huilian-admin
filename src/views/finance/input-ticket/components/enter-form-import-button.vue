<script>
import { acctCostInvoiceImportUrl } from '@/api/finance/acct-cost-invoice'
import { getDataDictionary } from '@/api/admin/dicts'
import { clone } from 'xe-utils'
import { fileDownload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'

const form = {
  serviceTaxFlag: enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')
}

export default {
  name: 'EnterFormImportButton',
  props: {
    onSuccess: Function,
    onError: Function
  },
  data() {
    return {
      enums,
      constant,
      acctCostInvoiceImportUrl,
      form: clone(form, true),
      dicts: {}
    }
  },
  async created() {
    const { DICTS_SERVICE_TAX_FLAG } = constant
    const dicts = await getDataDictionary([DICTS_SERVICE_TAX_FLAG])
    this.dicts = dicts
  },
  methods: {
    handleDownload() {
      if (this.form.serviceTaxFlag === enums.SERVICE_TAX_FLAG.getFieldByKey('VAT')) {
        fileDownload('a', 'b', 'c')
      } else {
        fileDownload('a', 'b', 'c')
      }
    }
  }
}
</script>

<template>
  <base-form ref="formRef" class="import-button-form" :model="form" label-width="80px" size="mini">
    <base-row>
      <base-col :span="24">
        <base-form-item label="模板" prop="template">
          <div class="import-button-form-template">
            <base-select
              v-model="form.serviceTaxFlag"
              placeholder="请选择发票类型"
              :options="dicts[constant.DICTS_SERVICE_TAX_FLAG]"
              :clearable="false"
            />
            <el-button size="mini" type="primary" @click="handleDownload">下载</el-button>
          </div>
        </base-form-item>
      </base-col>

      <base-col :span="24">
        <base-form-item label="文件上传" prop="uolpad">
          <base-upload
            :action="acctCostInvoiceImportUrl"
            :data="{
              serviceTaxFlag: form.serviceTaxFlag
            }"
            :show-file-list="false"
            :on-success="onSuccess"
            :on-error="onError"
            button-text="导入"
          ></base-upload>
        </base-form-item>
      </base-col>
    </base-row>
  </base-form>
</template>

<style lang="scss" scoped>
.import-button-form {
  & &-template {
    display: flex;
    width: 60%;
    ::v-deep .el-button {
      margin-left: 10px;
    }
  }
}
</style>
