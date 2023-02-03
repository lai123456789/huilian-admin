<script>
import { eachTree } from 'xe-utils'
import ViewRules from './view-rules'
import enums from '@/enums'

export default {
  name: 'VPermissionGrid',
  components: { ViewRules },
  props: {
    roleId: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      enums,
      loading: true,
      tableData: [],
      rulesVisible: false,
      rulesRow: {}
    }
  },
  methods: {
    initTableData(data, checks) {
      this.loading = true

      /* 菜单下面第一层如果按钮且子集(包括子孙级，全部拍平)就放在右边 */
      /* 如果是页签就放左边(放在children里)，子集(包括子孙级，全部拍平)放右边 */

      eachTree(this.handleCheckboxAssign(data, checks), item => {
        item.permis = []
        const childs = []

        if ('children' in item && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            const v = item.children[i]
            if (!v.children || !v.children.length) {
              if (v.type === '0' || v.type === '3') {
                childs.push(v)
              } else {
                item.permis.push(Object.assign(v, { parentId: item.id }))
              }
            } else if (v.children && v.children.length > 0) {
              childs.push(v)
            }
          }
          item.children = childs
        }
      })
      this.tableData = data
      this.loading = false
    },
    handleCheckboxAssign(raws, checks) {
      const arr = []
      eachTree(raws, raw => {
        raw.checked = false
        raw.isIndeterminate = false
        for (let i = 0; i < checks.length; i++) {
          if (checks[i] === raw.id) {
            raw.checked = true
            /* 每次匹配到值之后，就直接移除已经匹配到id */
            checks.splice(i, 1)
            if (raw.children) {
              arr.unshift(raw)
            }
            break
          }
        }
      })

      for (let i = 0; i < arr.length; i++) {
        const checkedItem = { checked: 0, isIndeterminate: 0 }
        for (let v = 0; v < arr[i].children.length; v++) {
          const item = arr[i].children[v]
          if (item.isIndeterminate) {
            checkedItem.isIndeterminate = 1
            break
          }
          if (item.checked) {
            checkedItem.checked = checkedItem.checked + 1
          }
        }

        if (checkedItem.isIndeterminate > 0) {
          arr[i].checked = false
          arr[i].isIndeterminate = true
        } else {
          if (!checkedItem.checked) {
            arr[i].checked = false
            arr[i].isIndeterminate = false
          } else if (checkedItem.checked !== arr[i].children.length) {
            arr[i].checked = false
            arr[i].isIndeterminate = true
          } else if (checkedItem.checked === arr[i].children.length) {
            arr[i].checked = true
            arr[i].isIndeterminate = false
          }
        }
      }
      return raws
    },
    handleRowAllCheckboxChange(val, row) {
      row.checked = val
      row.isIndeterminate = false
      if (row.permis.length) {
        row.permis.forEach(v => {
          v.checked = row.checked
        })
      }

      /* 如果底下还有子级就递归下面去更改状态 */
      this.getChild(row, val)

      this.handleFamilyAssign(row)
    },
    handleCheckboxChange(val, row, perm) {
      this.handleFamilyAssign(row.permis.length ? perm : row)
    },
    handleAllCheckboxChange(val, row) {
      row.checked = val
      row.isIndeterminate = false

      this.getChild(row, val)

      if (row.parentId !== -1) {
        this.handleFamilyAssign(row)
      }
    },
    outputCheck() {
      return this.initAssignCheck(this.tableData)
    },
    initAssignCheck(items, checks = []) {
      items.forEach(v => {
        if (v.checked || v.isIndeterminate) {
          checks.push(v.id)
        }
        if (v.permis && v.permis.length > 0) {
          v.permis.forEach(vv => {
            if (vv.checked) {
              checks.push(vv.id)
            }
          })
        }
        if (v.children && v.children.length > 0) {
          this.initAssignCheck(v.children, checks)
        }
      })
      return checks
    },
    /* 给父级赋值 */
    handleFamilyAssign(row) {
      this.getFamily(this.tableData, row.parentId).forEach(item => {
        const checkedItem = { checked: 0, isIndeterminate: 0, total: 0 }

        if (item.permis.length) {
          this.handlePermisChild(item, checkedItem)
        } else if ((!item.permis.length && item.children.length) || (item.type === '0' && !item.permis.length)) {
          for (let i = 0; i < item.children.length; i++) {
            const v = item.children[i]
            checkedItem.total = checkedItem.total + 1
            if (v.isIndeterminate) {
              checkedItem.isIndeterminate = 1
            }
            if (v.checked) {
              checkedItem.checked = checkedItem.checked + 1
            }
          }
        }

        if (checkedItem.isIndeterminate > 0) {
          item.checked = false
          item.isIndeterminate = true
        } else {
          if (!checkedItem.checked) {
            item.checked = false
            item.isIndeterminate = false
          } else if (checkedItem.checked !== checkedItem.total) {
            item.checked = false
            item.isIndeterminate = true
          } else if (checkedItem.checked === checkedItem.total) {
            item.checked = true
            item.isIndeterminate = false
          }
        }
      })
    },
    /* 获取父级 */
    getFamily(items, id) {
      var temp = []
      var forFn = function (arr, id) {
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i]
          if (item.id === id) {
            temp.push(item)
            forFn(items, item.parentId)
            break
          } else {
            if (item.children) {
              forFn(item.children, id)
            }
          }
        }
      }
      forFn(items, id)
      return temp
    },
    /* 给子级赋值 */
    getChild(item, checked) {
      if (item.children && item.children.length > 0) {
        item.children.forEach(v => {
          v.checked = checked
          v.isIndeterminate = false
          if (v.permis && v.permis.length > 0) {
            v.permis.forEach(vv => {
              vv.checked = checked
            })
          }
          if (v.children && v.children.length) {
            this.getChild(v, checked)
          }
        })
      }
    },
    handlePermisChild(row, checkedItem) {
      for (let i = 0; i < row.permis.length; i++) {
        checkedItem.total = checkedItem.total + 1
        if (row.permis[i].checked) {
          checkedItem.checked = checkedItem.checked + 1
        }
      }
      if (row.children && row.children.length > 0) {
        for (let i = 0; i < row.children.length; i++) {
          checkedItem.total = checkedItem.total + 1
          if (row.children[i].checked) {
            checkedItem.checked = checkedItem.checked + 1
          }
          if (row.children[i].children && row.children[i].children.length > 0) {
            this.handlePermisChild(row.children[i], checkedItem)
          }
        }
      }
      return checkedItem
    },
    /** 处理全选和取消全选 */
    handleCheckAllOrUnCheckAll(flag) {
      eachTree(this.tableData, item => {
        item.checked = flag
        item.isIndeterminate = false
        if (item.permis.length > 0) {
          item.permis.forEach(v => {
            v.checked = flag
            v.isIndeterminate = false
          })
        }
      })
    },
    /** 处理展开和收起 */
    handleDefaultExpandAll(flag) {
      if (flag) {
        this.toExpandAll()
      } else {
        this.toCloseAll()
      }
    },
    /** 展开的方法 */
    toExpandAll() {
      // 获取所有具有子级元素集合
      const expandElementList = document.getElementsByClassName('el-table__expand-icon')
      if (this.tableData.length !== 0 && expandElementList.length !== 0) {
        for (let i = 0; i < expandElementList.length; i++) {
          // 添加dafult类，如已经存在，取消添加
          expandElementList[i].classList.add('dafult')
        }
        // 获取所有已经展开元素集合
        const expanded = this.$el.getElementsByClassName('el-table__expand-icon--expanded')
        if (expanded) {
          for (let j = 0; j < expanded.length; j++) {
            // 如果已经展开，移除dafult类,剩余未展开的元素带有dafult类
            expanded[j].classList.remove('dafult')
          }
          // 获取所有dafult类：带有展开图标且还未展开的元素
          const dafult = this.$el.getElementsByClassName('dafult')
          for (let k = 0; k < dafult.length; k++) {
            // 点击事件：触发展开图标的点击事件
            dafult[k].click()
          }
        }
      }
    },
    /** 收起的方法 */
    toCloseAll() {
      if (this.tableData.length !== 0) {
        // 获取所有已展开元素
        const expanded = this.$el.getElementsByClassName('el-table__expand-icon--expanded')
        if (expanded) {
          for (let i = 0; i < expanded.length; i++) {
            // 点击事件：触发展开图标的点击事件
            expanded[i].click()
          }
        }
      }
    },
    handleDataRule(row) {
      const { id: menuId, ruleFlag } = row
      if (enums.WHETHER_STATUS.getFieldByKey('NO') === ruleFlag) return this.$message.error('未找到权限配置信息')
      this.rulesVisible = true
      this.rulesRow = { menuId, roleId: this.roleId }
    }
  }
}
</script>

<template>
  <div
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    class="v-permission-grid"
  >
    <el-table v-if="!loading" :data="tableData" height="100%" size="mini" row-key="id" border :tree-props="{ children: 'children' }">
      <el-table-column prop="name" width="180">
        <template slot-scope="scope">
          <div class="permiss-tree-cell">
            <span>{{ scope.row.name }}</span>
            <el-tooltip effect="dark" content="此项有权限配置信息" placement="top">
              <i
                v-if="scope.row.ruleFlag === enums.WHETHER_STATUS.getFieldByKey('YES')"
                class="is-flag el-icon-s-flag"
                @click.stop="handleDataRule(scope.row)"
              ></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="80">
        <template slot-scope="scope">
          <!-- <div v-if="scope.row.permis && !scope.row.permis.length" class="permiss-tree-checkbox is-all">
            <el-checkbox v-model="scope.row.checked" :indeterminate="scope.row.isIndeterminate" @change="(val) => handleAllCheckboxChange(val, scope.row)"></el-checkbox>
            <span :class="{'is-check': scope.row.checked}" @click="handleDataRule(scope.row)">全选</span>
          </div>
          <div v-else class="permiss-tree-checkbox is-all">
            <el-checkbox v-model="scope.row.checked" :indeterminate="scope.row.isIndeterminate" @change="(val) => handleRowAllCheckboxChange(val, scope.row)"></el-checkbox>
            <span :class="{'is-check': scope.row.checked}" @click="handleDataRule(scope.row)">全选</span>
          </div> -->
          <el-checkbox
            v-if="scope.row.permis && !scope.row.permis.length"
            v-model="scope.row.checked"
            :indeterminate="scope.row.isIndeterminate"
            @change="val => handleAllCheckboxChange(val, scope.row)"
            >全选</el-checkbox
          >
          <el-checkbox
            v-else
            v-model="scope.row.checked"
            :indeterminate="scope.row.isIndeterminate"
            @change="val => handleRowAllCheckboxChange(val, scope.row)"
            >全选</el-checkbox
          >
        </template>
      </el-table-column>
      <el-table-column prop="address" label="功能权限">
        <template slot-scope="scope">
          <template>
            <el-checkbox
              v-for="permi in scope.row.permis"
              :key="permi.id"
              v-model="permi.checked"
              class="permiss-tree-checkbox"
              @change="val => handleCheckboxChange(val, scope.row, permi)"
              >{{ permi.name }}</el-checkbox
            >
            <!-- <div v-for="permi in scope.row.permis" :key="permi.id" class="permiss-tree-checkbox">
              <el-checkbox v-model="permi.checked" @change="(val) => handleCheckboxChange(val, scope.row, permi)"></el-checkbox>
              <span :class="{'is-check': permi.checked}" @click="handleDataRule(permi)">{{ permi.name }}</span>
              <el-tooltip effect="dark" content="此项有权限配置信息" placement="top">
                <i v-if="permi.ruleFlag === enums.WHETHER_STATUS.getFieldByKey('YES')" class="is-flag el-icon-s-flag"></i>
              </el-tooltip>
            </div> -->
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="placeholder"></div>
    <view-rules :row="rulesRow" :visible.sync="rulesVisible" />
  </div>
</template>

<style lang="scss">
.v-permission-grid {
  height: 100%;
  .placeholder {
    overflow: hidden;
    height: 100%;
  }
  .el-checkbox {
    margin-right: 10px;
    .el-checkbox__label {
      font-size: 12px;
    }
  }
  .permiss-tree-cell {
    display: inline-block;
    cursor: pointer;
  }
  .permiss-tree-checkbox {
    display: inline-flex;
    align-items: center;
    margin-right: 30px;
    &.is-all {
      margin-right: 0;
    }
    > span {
      padding-top: 2px;
      cursor: pointer;
      &.is-check {
        color: var(--color-primary);
      }
    }
  }
  .is-flag {
    color: $--color-danger;
  }
}
</style>
