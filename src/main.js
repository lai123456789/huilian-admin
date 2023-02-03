import 'xe-utils'
import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import globalComponents from './components'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import '@/components/base/edit-table/src/interceptor'
import './router/permission'
import './styles/reset.scss'
import './styles/var.scss'
import './styles/vxe-table.scss'
import './styles/global.scss'
import { updateElementTheme } from '@/utils/update-element-theme'
import { message } from './utils/message'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VXETable)
Vue.use(globalComponents)

Vue.prototype.$message = message
// 将事件总线作为Vue.prototype的属性，方便每个组件中通过this.$eventBus获取事件总线
Vue.prototype.$eventBus = new Vue({})

const initApp = async function () {
  await updateElementTheme({ primaryColor: store.state.settings.themeColor })
  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  })
}

initApp()

