import config from '@/config'
import store from '@/store'
/**
 * base-keep-alive： 重写了vue原先得keep-alive
 *
 * 主要解决问题场景:
 *   先说下原生得keep-alive原理,通过路由中定义得name值和组件中的name值或者注册的标签名称进行匹配
 *   缓存,缓存的key必须唯一, 可以通过指定router-view的key实现。总之, 路由name和组件name值必须对
 *   应且唯一。
 *   系统多页签缓存是在 layout\components\AppMain.vue 做的,因为运用到了多级路由,由于vue-router机制,
 *   需要定义多个router-view, 类似仓库管理-入库 模块(Warehouse\WarehousingManagement\index.vue),
 *   这也意味着,通仓储入库、提验货等,都是通过这个渲染的, 由于无法动态指定name值,从而导致 AppMain.vue中
 *   的keep-alive无法缓存页面。
 *
 * 基于以上对keep-alive进行以下改造:
 *   1. 组件名称获取更改为路由名称
 *   2. cache缓存key也更改为路由名称
 *   3. pruneCache
 */
const _toString = Object.prototype.toString
function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
/**
   * 1. 主要更改了 name 值获取的规则
   * @param {*} opts
   */
function getComponentName(opts) {
  const { name, path } = this.$route
  if (config.staticRouteWhites.includes(name)) {
    return store.getters.menuMap[decodeURI(path)].id
  }

  // return opts && (opts.Ctor.options.name || opts.tag)
  return name
}
function isDef(v) {
  return v !== undefined && v !== null
}
function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory
}
function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache(keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode = cache[key]
    if (cachedNode) {
      // ------------ 3. 之前默认从router-view取储存key值, 现在改为路由name, 所以这里得改成当前key
      // const name = getComponentName.call(keepAliveInstance, cachedNode.componentOptions)
      const name = key
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry(
  cache,
  key,
  keys,
  current
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes = [String, RegExp, Array]

export default {
  name: 'BaseKeepAlive',
  // abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created() {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted() {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render() {
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name = getComponentName.call(this, componentOptions)
      // ---------- 对于没有name值得设置为路由得name, 支持vue-devtool组件名称显示
      if (!componentOptions.Ctor.options.name) {
        vnode.componentOptions.Ctor.options.name
      }
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      // ------------------- 储存的key值, 默认从router-view设置的key中获取
      // const key = vnode.key == null
      //   ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
      //   : vnode.key

      // ------------------- 2. 储存的key值设置为路由中得name值
      const key = name

      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}

