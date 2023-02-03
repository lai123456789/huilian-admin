<script>
import BaseWangEditor from '@/components/base/wang-editor'
import { getCurrentUserMenu, getMenuById, updateBusinessNotesMenu } from '@/api/admin/menu'

export default {
  name: 'Help',
  components: { BaseWangEditor },
  data() {
    this.editor = null
    return {
      menus: [],
      filterText: '',
      form: {},
      rules: {},
      menuId: undefined,
      loading: true,
      btnLoading: false,
      loaded: false,
      disabled: false,
      visible: false,
      treeVisible: false,
      defaultExpandedKeys: [],
      currentNodeKey: 0
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeRef.filter(val)
    }
  },
  created() {
    const { params } = this.$route
    const id = params.id || void 0
    if (id) {
      this.loading = true
      this.defaultExpandedKeys = [id]
      this.currentNodeKey = id
      this.treeVisible = true
      this.menuId = id
      getMenuById(id).then(res => {
        this.editor.setHtml(res.data.businessNotes)
        this.editor.enable()
        this.loading = false
      })
    } else {
      this.treeVisible = true
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleNodeClick(data) {
      this.editor.clear()
      // 没有 children 最后一级可点击
      if (!data.children) {
        this.disabled = false
        this.editor.enable()
        this.menuId = data.id
        this.loading = true
        getMenuById(this.menuId).then(res => {
          this.editor.setHtml(res.data.businessNotes || '')
          this.loading = false
        })
      } else {
        this.disabled = true
        this.editor.disable()
      }
    },
    createInstance(editor) {
      this.editor = editor
      this.loading = true
      this.editor.disable()
      getCurrentUserMenu({ parentId: void 0 }).then(res => {
        this.menus = res.data
        this.loading = false
        this.loaded = true
      })
    },
    handleSave() {
      this.btnLoading = true
      updateBusinessNotesMenu({
        businessNotes: this.editor.getHtml(),
        menuId: this.menuId
      }).then(() => {
        this.$message.success('操作成功')
        this.btnLoading = false
      })
    }
  }
}
</script>

<template>
  <div class="help">
    <base-row class="help-row" :gutter="10">
      <base-col class="help-menu" :span="5">
        <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="margin-bottom: 10px" />
        <div v-if="treeVisible" class="help-menu-main">
          <el-scrollbar wrap-class="help-menu-scrollbar-wrap">
            <el-tree
              ref="treeRef"
              node-key="id"
              highlight-current
              :default-expanded-keys="defaultExpandedKeys"
              :current-node-key="currentNodeKey"
              :data="menus"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
            ></el-tree>
          </el-scrollbar>
        </div>
      </base-col>
      <base-col class="help-main" :span="19">
        <base-row class="help-main-row">
          <div class="help-main-editor">
            <base-wang-editor
              ref="wangEditorRef"
              v-loading="loading"
              element-loading-text="拼命加载中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.8)"
              @createInstance="createInstance"
            ></base-wang-editor>
          </div>
        </base-row>
        <div class="help-main-btn-bar">
          <el-button type="primary" :disabled="disabled" :loading="btnLoading" icon="el-icon-check" @click="handleSave">保存</el-button>
        </div>
      </base-col>
    </base-row>
  </div>
</template>

<style lang="scss" scoped>
.help {
  width: 100%;
  height: 100%;
  &-row {
    height: 100%;
  }
  &-menu {
    display: flex;
    padding: 15px 20px 0 !important;
    height: 100%;
    flex-direction: column;
    ::v-deep .el-scrollbar {
      height: 100%;
    }
    &-main {
      height: 0;
      flex: 1;
    }
    ::v-deep &-scrollbar-wrap {
      overflow-x: auto;
    }
  }
  &-main {
    display: flex;
    padding-right: 0 !important;
    padding-left: 0 !important;
    height: 100%;
    border-left: 1px solid #cccccc;
    flex-direction: column;
    &-row {
      display: flex;
      height: 0;
      flex-direction: column;
      flex: 1;
    }
    &-editor {
      height: 0;
      flex: 1;
    }
    &-btn-bar {
      border-top: 1px solid #cccccc;
      text-align: right;
      ::v-deep .el-button {
        margin: 0;
        padding-right: 15px;
        padding-left: 15px;
        height: 40px;
        font-size: 12px;
        border: 0;
        border-radius: 0;
        -webkit-box-shadow: -1px 0 0 0 #e8e8e8;
        box-shadow: -1px 0 0 0 #e8e8e8;
      }
    }
  }
}
</style>
