/**
 * 常量的定义:
 *  1. 类似根据某一个key去设置值，这个key是一个固定字符串的情况(eg: 设置本地存储的时候设置值；状态管理的时候)
 *  2. 定义常量时，参考 appConstant 的格式去写，包括注释
 */
import appConstant from './modules/storage'
import dictsConstant from './modules/dicts'
import tableNameConstant from './modules/table-name'
import autocompleteKeyConstant from './modules/autocomplete-key'
import fileModule from './modules/file-module'
import permission from './modules/permission'
import route from './modules/route'
import sysNo from './modules/sys-no'
import params from './modules/params'

export default Object.freeze({
  ...appConstant,
  ...dictsConstant,
  ...tableNameConstant,
  ...autocompleteKeyConstant,
  ...fileModule,
  ...permission,
  ...route,
  ...sysNo,
  ...params
})
