<script>
import { addResizeListener, removeResizeListener } from 'element-ui/lib/utils/resize-event'
import { mapGetters } from 'vuex'
import ScrollPane from './scroll-pane.vue'
import path from 'path'
import config from '@/config'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: [],
      padding: 0,
      navOffset: 0
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.routes
    },
    ...mapGetters(['menuMap', 'permission_routes'])
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
      this.handleResize()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
    addResizeListener(this.$el, this.handleResize)
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) {
      removeResizeListener(this.$el, this.handleResize)
    }
  },
  methods: {
    handleResize() {
      this.$nextTick(() => {
        const scrollPaneWidth = this.$refs.scrollPane.$el.offsetWidth
        const tagWrapWidth = this.$refs.tagWrap.offsetWidth
        this.navOffset = 0
        if (tagWrapWidth > scrollPaneWidth) {
          this.padding = 30
        } else {
          this.padding = 0
        }
      })
    },
    scrollPrev() {
      const scrollPaneWidth = this.$refs.scrollPane.$el.offsetWidth
      const currentOffset = this.navOffset

      if (!currentOffset) return

      const newOffset = currentOffset > scrollPaneWidth ? currentOffset - scrollPaneWidth : 0

      this.navOffset = newOffset
      this.$refs.scrollPane.$children[0].wrap.scrollLeft = this.navOffset
    },
    scrollNext() {
      const scrollPaneWidth = this.$refs.scrollPane.$el.offsetWidth
      const tagWrapWidth = this.$refs.tagWrap.offsetWidth
      const currentOffset = this.navOffset
      if (tagWrapWidth - currentOffset <= scrollPaneWidth) return

      const newOffset =
        tagWrapWidth - currentOffset > scrollPaneWidth * 2 ? currentOffset + scrollPaneWidth : tagWrapWidth - scrollPaneWidth
      this.navOffset = newOffset
      this.$refs.scrollPane.$children[0].wrap.scrollLeft = this.navOffset
    },
    isActive(route) {
      return route.path === decodeURI(this.$route.path)
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = (this.affixTags = this.filterAffixTags(this.routes))
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags() {
      const { name, path, meta, fullPath } = this.$route
      let newName = name
      const obj = {}

      for (const key in meta) {
        if (Object.hasOwnProperty.call(meta, key)) {
          obj[key] = meta[key]
        }
      }

      if (config.staticRouteWhites.includes(name)) {
        newName = this.menuMap[decodeURI(path)].id
        Object.assign(obj, { id: this.menuMap[decodeURI(path)].id, title: this.menuMap[decodeURI(path)].title })
      }
      if (name) {
        this.$store.dispatch('tagsView/addView', { path: decodeURI(path), name: newName, fullPath, meta: obj })
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === decodeURI(this.$route.path)) {
            this.navOffset = this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              const { name, path, meta, fullPath } = this.$route
              let newName = name
              const obj = {}

              for (const key in meta) {
                if (Object.hasOwnProperty.call(meta, key)) {
                  obj[key] = meta[key]
                }
              }

              if (config.staticRouteWhites.includes(name)) {
                newName = this.menuMap[decodeURI(path)].id
                Object.assign(obj, { id: this.menuMap[decodeURI(path)].id, title: this.menuMap[decodeURI(path)].title })
              }

              this.$store.dispatch('tagsView/updateVisitedView', { path: decodeURI(path), name: newName, fullPath, meta: obj })
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      /* 在iframe组件监听的右键刷新 */
      this.$eventBus.$emit('refreshView', view)
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }

        /* 在iframe组件监听点击关闭按钮 */
        this.$eventBus.$emit('closeView', view)
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag.path)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.offsetY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    handleScroll() {
      this.closeMenu()
    }
  }
}
</script>

<template>
  <div id="tags-view-container" class="tags-view-container" :style="{ padding: `0 ${padding}px` }">
    <template v-if="padding">
      <span class="tag-nav-btn tag-prev" @click="scrollPrev"><i class="el-icon-arrow-left"></i></span>
      <span class="tag-nav-btn tag-next" @click="scrollNext"><i class="el-icon-arrow-right"></i></span>
    </template>
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <div ref="tagWrap" class="tag-wrap">
        <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :key="tag.path"
          :class="isActive(tag) ? 'active' : ''"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          tag="span"
          class="tags-view-item"
          @click.middle.native="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          @contextmenu.prevent.native="openMenu(tag, $event)"
        >
          <!-- {{ tag.meta.title || 'no-title' }} -->
          {{ tag.title }}
          <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
        </router-link>
      </div>
    </scroll-pane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其它</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
  position: relative;
  width: 100%;
  height: 34px;
  border-bottom: 1px solid #d8dce5;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  .tag-nav-btn {
    position: absolute;
    display: inline-block;
    width: 30px;
    font-size: 12px;
    text-align: center;
    color: #909399;
    cursor: pointer;
    line-height: 34px;
    &.tag-prev {
      left: 0;
    }
    &.tag-next {
      right: 0;
    }
  }
  .tags-view-wrapper {
    .tags-view-item {
      position: relative;
      display: inline-block;
      margin-top: 4px;
      margin-left: 5px;
      padding: 0 8px;
      height: 26px;
      font-size: 12px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #ffffff;
      cursor: pointer;
      line-height: 26px;
      // &:last-of-type {
      //   margin-right: 15px;
      // }
      &.active {
        border-color: var(--color-primary);
        color: #ffffff;
        background-color: var(--color-primary);
        &::before {
          position: relative;
          display: inline-block;
          margin-right: 2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffffff;
          content: '';
        }
      }
    }
  }
  .contextmenu {
    position: absolute;
    z-index: 3000;
    margin: 0;
    padding: 5px 0;
    font-size: 12px;
    font-weight: 400;
    border-radius: 4px;
    color: #333333;
    background: #ffffff;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    list-style-type: none;
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eeeeee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tag-wrap {
    display: inline-block;
  }
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &::before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        color: #ffffff;
        background-color: #b4bccc;
      }
    }
  }
}
</style>
