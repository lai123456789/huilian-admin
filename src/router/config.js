import UreportIframe from '@/views/iframe/ureport'
import JmreportIframe from '@/views/iframe/jmreport'
import JmreportDesigner from '@/views/iframe/jmreport-designer'
import ExternalIframe from '@/views/iframe/external'

export const routeConfigs = [
  {
    path: '/ureport/preview/:id',
    name: 'Ureport',
    meta: { title: 'Ureport', customComponent: UreportIframe, iframe: true, componentPath: '/views/iframe/ureport/index' }
  },
  {
    path: '/jmreport/view/:id',
    name: 'Jmreport',
    meta: { title: 'Jmreport', customComponent: JmreportIframe, iframe: true, componentPath: '/views/iframe/jmreport/index' }
  },
  {
    path: '/voucher-view/:templateNo',
    name: 'VoucherView',
    meta: { title: '凭证', componentPath: '/views/finance/acct-voucher/index' },
    component: () => import('@/views/finance/acct-voucher/index')
  },
  {
    path: '/jmreport/list',
    name: 'JmreportDesigner',
    meta: { title: 'JmreportDesigner', customComponent: JmreportDesigner, iframe: true, componentPath: '/views/iframe/jmreport-designer/index' }
  },
  {
    path: '/iframe/external/:id',
    name: 'External',
    meta: { title: 'External', customComponent: ExternalIframe, iframe: true, componentPath: '/views/iframe/external/index' }
  }
]

export const externals = []

routeConfigs.forEach(route => {
  const { path, name, meta, component } = route
  externals.push({
    path: `/external${path}`,
    hidden: true,
    name: `${name}External`,
    meta,
    component: component || meta.customComponent
  })
})

