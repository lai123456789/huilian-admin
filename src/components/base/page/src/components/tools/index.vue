<script>
import ToolsSetting from './components/setting'
import { downloadExcel } from '@/utils/download-excel'
import { merge } from 'xe-utils'

export default {
  name: 'BaseTools',
  inject: ['basePage'],
  components: { ToolsSetting },
  data() {
    return {
      visibleSetting: false
    }
  },
  computed: {
    toolsConfig() {
      return merge(
        {
          refresh: {
            visible: true
          },
          download: {
            visible: true
          },
          setting: {
            visible: true
          }
        },
        this.basePage.toolsConfig
      )
    }
  },
  methods: {
    /**
     * 点击刷新按钮不重新请求数据字典只请求表格数据
     */
    handleRefresh() {
      this.basePage.refresh(false)
    },
    handleDownload() {
      const { tableData, columns, optionsCache } = this.basePage
      downloadExcel(tableData, columns, optionsCache)
    },
    handleSetting() {
      this.visibleSetting = true
    }
  }
}
</script>

<template>
  <div class="base-tools">
    <!-- 表格刷新 -->
    <el-button
      v-if="toolsConfig.refresh.visible"
      :disabled="false"
      size="mini"
      icon="el-icon-refresh"
      circle
      @click="handleRefresh"
    ></el-button>
    <!-- 表格数据下载 -->
    <el-button
      v-if="toolsConfig.download.visible"
      :disabled="basePage.loading"
      size="mini"
      icon="el-icon-download"
      circle
      @click="handleDownload"
    ></el-button>
    <!-- 表格配置 -->
    <el-button
      v-if="toolsConfig.setting.visible"
      :disabled="false"
      size="mini"
      icon="el-icon-setting"
      circle
      @click="handleSetting"
    ></el-button>
    <tools-setting :visible.sync="visibleSetting"></tools-setting>
  </div>
</template>

<style lang="scss">
.base-tools {
  .el-button {
    margin-bottom: 10px;
  }
}
</style>
