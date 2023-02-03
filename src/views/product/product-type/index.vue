<script>
import { productTypeTree, updateProductType, deleteProductTypeById, saveProductType, getProductTypeById } from '@/api/product/product-type'
import { filterTree, clone } from 'xe-utils'
import { mapGetters } from 'vuex'
import constant from '@/constant'

const form = {
  typeName: '',
  sort: 1,
  parentId: void 0,
  parentName: '',
  id: 0
}

export default {
  name: 'ProductType',
  data() {
    return {
      treeData: [],
      permissionPrefixAdd: false,
      mask: 'Added',
      rules: {
        parentId: [{ required: true, message: '请输入父级节点' }],
        id: [{ required: true, message: '请输入节点编号' }],
        typeName: [{ required: true, message: '请输入类别名称' }],
        sort: [{ required: true, message: '请输入排序值' }]
      },
      formEdit: true,
      form: clone(form, true),
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  mounted() {
    this.permissionPrefixAdd = this.permissions[constant.PERMISSION_PRODUCT_TYPE_ADD]
    this.getTreeData()
  },
  methods: {
    async getTreeData() {
      const res = await productTypeTree()
      this.treeData = res.data
    },
    async handleNodeClick(data) {
      this.clearValidate()
      const res = await getProductTypeById(data.id)
      const form = res.data
      const parentNames = filterTree(this.treeData, item => item.id === data.parentId)
      Object.assign(this.form, { parentName: parentNames.length > 0 ? parentNames[0].name : '顶级父级' }, form)
    },
    append(e, node, data) {
      e.stopPropagation()
      this.mask = 'Added'
      this.form = clone(form, true)
      this.clearValidate()
      // undefined时, 说明从顶层点击的新增
      if (node) {
        const { id, name } = data
        this.form.parentId = id
        this.form.parentName = name
      } else {
        this.form.parentId = 0
        this.form.parentName = '顶级父级'
      }
      this.form.name = ''
      this.form.sort = 1
      this.formEdit = false
    },
    async modify(e, node, data) {
      e.stopPropagation()
      this.clearValidate()
      const res = await getProductTypeById(data.id)
      this.mask = 'Modify'
      const form = res.data
      this.formEdit = false
      const parentNames = filterTree(this.treeData, item => item.id === data.parentId)
      Object.assign(this.form, { parentName: parentNames.length > 0 ? parentNames[0].name : '顶级父级' }, form)
    },
    remove(e, node, data) {
      e.stopPropagation()
      this.clearValidate()
      this.$confirm('是否确认删除这 1 条记录?')
        .then(() => {
          deleteProductTypeById(data.id).then(() => {
            this.getTreeData()
            this.handleCancel()
            this.$message.success('删除成功')
          })
        })
        .catch(() => {})
    },
    renderContent(h, { node, data }) {
      return (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          <span>
            {this.permissions[constant.PERMISSION_PRODUCT_TYPE_ADD] && (
              <i title="新增" class="opera-icon el-icon-plus" on-click={e => this.append(e, node, data)}></i>
            )}
            {this.permissions[constant.PERMISSION_PRODUCT_TYPE_EDIT] && (
              <i title="修改" class="opera-icon el-icon-edit" on-click={e => this.modify(e, node, data)}></i>
            )}
            {this.permissions[constant.PERMISSION_PRODUCT_TYPE_DEL] && (
              <i title="删除" class="opera-icon el-icon-delete" on-click={e => this.remove(e, node, data)}></i>
            )}
          </span>
        </span>
      )
    },
    handleSubmit() {
      this.$refs.form.validate((valid, errMsgs) => {
        if (valid) {
          if (this.mask === 'Modify') {
            updateProductType(this.form).then(() => {
              this.getTreeData()
              this.handleCancel()
              this.$message.success('更新成功')
            })
          } else {
            saveProductType(this.form).then(() => {
              this.getTreeData()
              this.handleCancel()
              this.$message.success('创建成功')
            })
          }
        } else {
          const errMsg = Object.values(errMsgs)[0][0]
          this.$message.error(errMsg.message)
        }
      })
    },
    handleCancel() {
      this.formEdit = true
      this.form = clone(form, true)
    },
    clearValidate() {
      this.$refs.form.clearValidate()
    }
  }
}
</script>

<template>
  <div class="product-type">
    <div class="product-type-l">
      <div class="tree-wrapper">
        <div class="tree-header">
          <el-button v-if="permissionPrefixAdd" type="primary" size="mini" icon="el-icon-plus" @click="append($event)">新增</el-button>
        </div>
        <div class="tree-body">
          <el-tree
            node-key="id"
            highlight-current
            default-expand-all
            :data="treeData"
            :props="defaultProps"
            :expand-on-click-node="false"
            :render-content="renderContent"
            @node-click="handleNodeClick"
          ></el-tree>
        </div>
      </div>
    </div>
    <div class="product-type-r">
      <div class="form-wrapper">
        <base-form
          ref="form"
          size="mini"
          label-suffix=":"
          label-width="90px"
          label-position="right"
          :rules="rules"
          :model="form"
          :show-message="false"
        >
          <base-row>
            <base-col :span="24">
              <base-form-item label="父级节点" prop="parentName">
                <base-input v-model="form.parentName" disabled placeholder="请输入父级节点" />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="类别名称" prop="typeName">
                <base-input v-model="form.typeName" :disabled="formEdit" placeholder="请输入类别名称" />
              </base-form-item>
            </base-col>

            <base-col :span="24">
              <base-form-item label="排序" prop="sort">
                <base-input-number v-model="form.sort" :disabled="formEdit" :min="1" controls align="center"></base-input-number>
              </base-form-item>
              <base-form-item v-if="!formEdit">
                <el-button type="primary" size="small" @click="handleSubmit">保存</el-button>
                <el-button size="small" @click="handleCancel">取消</el-button>
              </base-form-item>
            </base-col>
          </base-row>
        </base-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$gutter: 10px;
.product-type {
  position: relative;
  height: 100%;
  background-color: #f3f3f3;
  .product-type-l {
    height: 100%;
    .tree-wrapper {
      padding-right: $gutter;
      width: 400px;
      height: 100%;
      box-sizing: border-box;
      .tree-header {
        padding: $gutter;
        height: 50px;
        border-bottom: 1px solid #f3f3f3;
        text-align: right;
        background-color: #ffffff;
      }
      .tree-body {
        overflow: auto;
        padding: 5px;
        height: calc(100% - 50px);
        background-color: #ffffff;
        .el-tree-node__content {
          height: 30px;
        }
        .custom-tree-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 8px;
          font-size: 14px;
          flex: 1;
          .opera-icon {
            padding: 0 10px;
            // &.el-icon-plus {coo}
          }
        }
      }
    }
  }
  .product-type-r {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 400px;
    background-color: #ffffff;
    .form-wrapper {
      padding: 50px 30px 10px 20px;
      height: 100%;
    }
  }
}
</style>
