<script>
import draggable from 'vuedraggable'
import { clone } from 'xe-utils'
import { getStorage, setStorage } from '@/utils/storage'
import config from '@/config'

export default {
  name: 'ToolsSetting',
  inject: ['basePage'],
  components: { draggable },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: this.visible,
      tableColumns: []
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.handleColumns()
        this.show = true
      }
    },
    show(newValue) {
      this.$emit('update:visible', newValue)
    }
  },
  methods: {
    handleColumns() {
      this.tableColumns = clone(this.basePage.columns, true)
      const cacheColumns = getStorage({ name: `${config.tablePrefix}_${this.basePage.name}` })
      if (cacheColumns) {
        this.tableColumns = cacheColumns
      } else {
        // 本地存储没有值的情况
        this.tableColumns.forEach(column => {
          column.isOvertCovert = true
        })
      }
    },
    handleDraggableInput(columns) {
      this.tableColumns = columns
    },
    handleOvertCovertColumn(column) {
      const tableColumns = []
      this.tableColumns.forEach(tableColumn => {
        if (tableColumn.field === column.field) {
          tableColumn.isOvertCovert = !tableColumn.isOvertCovert
        }
        tableColumns.push(tableColumn)
      })
      this.tableColumns = tableColumns
    },
    handleSave(done) {
      setStorage({ name: `${config.tablePrefix}_${this.basePage.name}`, content: this.tableColumns })
      this.basePage.refresh(false, () => {
        this.show = false
        done()
        this.$message.success('调整成功')
      })
    }
  }
}
</script>

<template>
  <base-drawer :visible.sync="show" size="400px" @save="handleSave">
    <div class="tools-setting">
      <el-row class="tools-setting-columns" :gutter="20">
        <draggable :value="tableColumns" @input="handleDraggableInput">
          <transition-group type="transition" tag="div">
            <template v-for="(column, index) in tableColumns">
              <template v-if="!Object.hasOwnProperty.call(column, 'visible') || column.visible">
                <el-col :key="column.field" :class="['tools-setting-column', { 'line-through': !column.isOvertCovert }]" :span="8">
                  <span class="tools-setting-column-seq">{{ index + 1 }}.</span>
                  <span class="tools-setting-column-title" @click="handleOvertCovertColumn(column)">{{ column.title }}</span>
                </el-col>
              </template>
            </template>
          </transition-group>
        </draggable>
      </el-row>
    </div>
  </base-drawer>
</template>

<style lang="scss">
.tools-setting {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  &-columns {
    margin: 0 !important;
    padding: 10px;
  }
  &-column {
    display: flex;
    margin-bottom: 7px;
    font-size: 14px;
    user-select: none;
    line-height: 30px;
    &.line-through {
      text-decoration: line-through;
    }
    &-seq {
      margin-right: 7px;
      font-size: 12px;
    }
    &-title {
      display: inline-block;
      cursor: pointer;
    }
  }
}
</style>
