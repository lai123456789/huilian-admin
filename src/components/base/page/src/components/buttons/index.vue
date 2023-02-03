<script>
import Render from './render'
import { isArray } from 'xe-utils'

export default {
  name: 'ToolsButtons',
  inject: ['basePage'],
  components: { Render },
  data() {
    return {
      selectRows: []
    }
  },
  computed: {
    buttonsOptions() {
      const buttonsConfig = this.basePage.buttonsConfig
      if (!buttonsConfig) {
        return false
      } else {
        for (const key in buttonsConfig) {
          if (isArray(buttonsConfig[key])) {
            buttonsConfig[key].forEach(item => {
              this.$set(item, 'loading', false)
            })
          } else {
            this.$set(buttonsConfig[key], 'loading', false)
          }
        }
        return buttonsConfig
      }
    }
  },
  methods: {
    handleAdded(config) {
      const openLoading = () => (config.loading = true)
      const closeLoading = () => (config.loading = false)
      config.handler({ openLoading, closeLoading })
    },
    handleEdit(config) {
      const openLoading = () => (config.loading = true)
      const closeLoading = () => (config.loading = false)
      config.handler(this.selectRows[0], { openLoading, closeLoading })
    },
    handleDelete(config) {
      const openLoading = () => (config.loading = true)
      const closeLoading = () => (config.loading = false)
      const { selectRows } = this
      if (selectRows.length === 0) return this.$message.warning('请先选择一条数据')
      // 判断是否多选
      if (Object.hasOwnProperty.call(config, 'multiple') && config.multiple) {
        config.handler(selectRows, { openLoading, closeLoading })
      } else {
        if (selectRows.length > 1) return this.$message.warning('当前删除功能不支持批量操作')
        config.handler(selectRows[0], { openLoading, closeLoading })
      }
    },
    handleMoresBtn(item) {
      const openLoading = () => (item.loading = true)
      const closeLoading = () => (item.loading = false)
      item.handler(!item.noNeedRows ? this.selectRows : [], { openLoading, closeLoading })
    },
    /**
     * 更新表格选中的数据
     * @param {array<any>} selectRows
     */
    updateSelectRows(selectRows) {
      this.selectRows = selectRows
    }
  }
}
</script>

<template>
  <div v-if="buttonsOptions" class="tools-buttons">
    <el-button
      v-if="buttonsOptions.add && buttonsOptions.add.visible"
      type="primary"
      :disabled="false"
      size="mini"
      :loading="buttonsOptions.add.loading"
      @click="handleAdded(buttonsOptions.add)"
      >{{ buttonsOptions.add.label || '新增' }}</el-button
    >
    <el-button
      v-if="buttonsOptions.edit && buttonsOptions.edit.visible"
      type="warning"
      size="mini"
      :loading="buttonsOptions.edit.loading"
      :disabled="selectRows.length !== 1"
      @click="handleEdit(buttonsOptions.edit)"
    >
      {{ buttonsOptions.edit.label || '修改' }}</el-button
    >
    <el-button
      v-if="buttonsOptions.del && buttonsOptions.del.visible"
      type="danger"
      size="mini"
      :loading="buttonsOptions.del.loading"
      :disabled="selectRows.length === 0"
      @click="handleDelete(buttonsOptions.del)"
    >
      {{ buttonsOptions.del.label || '删除' }}</el-button
    >
    <template v-if="buttonsOptions && Object.hasOwnProperty.call(buttonsOptions, 'mores') && buttonsOptions.mores.length">
      <template v-for="(item, index) in buttonsOptions.mores">
        <el-button
          v-if="item.visible && !item.render"
          :key="`BUTTONS_${index}`"
          size="mini"
          :plain="item.plain || false"
          :loading="item.loading"
          :disabled="!item.noNeedRows && (item.multiple ? !(selectRows.length > 0) : selectRows.length !== 1)"
          :type="item.type || 'primary'"
          @click="handleMoresBtn(item)"
          >{{ item.label }}</el-button
        >
        <template v-else-if="item.visible && item.render">
          <render
            :key="`BUTTONS_${index}`"
            :render="item.render"
            :rows="selectRows"
            :item="item"
            :disabled="!item.noNeedRows && (item.multiple ? !(selectRows.length > 0) : selectRows.length !== 1)"
          ></render>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.tools-buttons {
  display: inline-block;
  flex: 1;
  text-align: left;
  & ::v-deep .el-button {
    margin-bottom: 10px;
  }
}
</style>
