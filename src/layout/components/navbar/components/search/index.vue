<script>
import Fuse from 'fuse.js'
import enums from '@/enums'
import { isExternal } from '@/utils'

export default {
  name: 'HeaderSearch',
  data() {
    return {
      show: false,
      fuse: void 0,
      value: '',
      options: []
    }
  },
  computed: {
    permissionRoutes() {
      return this.$store.getters.routes
    }
  },
  watch: {
    permissionRoutes() {
      this.initFuse(this.generateRoutes(this.permissionRoutes))
    },
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.handleClose)
      } else {
        document.body.removeEventListener('click', this.handleClose)
      }
    }
  },
  mounted() {
    this.initFuse(this.generateRoutes(this.permissionRoutes))
  },
  methods: {
    initFuse(list) {
      this.fuse = new Fuse(list, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          {
            name: 'title',
            weight: 1
          },
          {
            name: 'path',
            weight: 0.3
          }
        ]
      })
    },
    handleClick() {
      this.show = !this.show
      if (this.show) {
        this.$refs.headerSearchSelectRef?.focus()
      }
    },
    handleClose() {
      this.$refs.headerSearchSelectRef?.blur()
      this.options = []
      this.show = false
    },
    handleSearchChange({ openMode, path }) {
      if (openMode === enums.OPEN_MODE.getFieldByKey('EXTERNAL')) {
        if (isExternal(path)) {
          window.open(path)
        } else {
          window.open(`/#${path}`)
        }
      } else {
        this.$router.push(path)
      }
      this.value = ''
      this.options = []
      this.$nextTick(() => {
        this.show = false
      })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.options = this.fuse.search(query)
      } else {
        this.options = []
      }
    },
    // 筛选出可以显示在侧栏中的路由
    generateRoutes(routes, basePath = '/', prefixTitle = []) {
      let res = []

      for (const router of routes) {
        // skip hidden router
        if (router.hidden) {
          continue
        }

        const data = {
          id: router.meta?.id,
          path: router.path,
          openMode: router.meta?.openMode,
          title: [...prefixTitle]
        }

        if (router.meta && router.meta.title) {
          data.title = [...data.title, router.meta.title]

          if (router.redirect !== 'noRedirect' && !router.meta?.isDir) {
            // only push the routes with title
            // special case: need to exclude parent router without redirect
            res.push(data)
          }
        }

        // recursive child routes
        if (router.children) {
          const tempRoutes = this.generateRoutes(router.children, data.path, data.title)
          if (tempRoutes.length >= 1) {
            res = [...res, ...tempRoutes]
          }
        }
      }
      return res
    }
  }
}
</script>

<template>
  <div :class="{ show: show }" class="header-search">
    <base-svg-icon icon-class="search" title="全局搜索菜单" @click.stop="handleClick" />
    <el-select
      ref="headerSearchSelectRef"
      v-model="value"
      :remote-method="remoteMethod"
      remote
      filterable
      default-first-option
      placeholder="搜索菜单名称"
      class="header-search-select"
      @change="handleSearchChange"
    >
      <el-option v-for="item in options" :key="item.id" :value="item" :label="item.title.join(' > ')" />
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.header-search {
  .search-icon {
    padding-top: 3px;
    font-size: 17px;
    font-weight: bolder;
    cursor: pointer;
    vertical-align: middle;
  }
  &-select {
    display: inline-block;
    overflow: hidden;
    width: 0;
    font-size: 18px;
    border-radius: 0;
    background: transparent;
    transition: width 0.2s;
    vertical-align: middle;
    ::v-deep .el-input__inner {
      padding-right: 0;
      padding-left: 0;
      border: 0;
      border-bottom: 1px solid #d9d9d9;
      border-radius: 0;
      box-shadow: none !important;
      vertical-align: middle;
    }
  }
  &.show {
    .header-search-select {
      margin-left: 10px;
      width: 160px;
    }
  }
}
</style>
