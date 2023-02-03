export default {
  // ------  系统相关  ---------
  /** 全局的系统前缀 */
  prefix: 'SCP',
  /** 全局标题 */
  title: 'SCP',
  /** 表格名字前缀 */
  tablePrefix: 'TABLE',

  // ------  接口相关  ---------
  /** 登录和刷新token的接口authorization加密标识 */
  authorization: 'Basic c2NwOnNjcA==',
  /** 接口前缀 */
  apiPrefix: '/api',
  /** 配置请求头 */
  apiHeaders: {
    /** 2:同途  4: 公司自用的 */
    'TENANT-ID': '4',
    /** 'henry-mac': 连接后端本地时设置该值, 'beta': 连接后端云上设置该值 */
    VERSION: 'henry-mac'
  },
  /** 刷新token的接口每隔多少时间执行一次 */
  refreshTokenExecTime: 300000,

  // ------  权限相关  ---------
  /** 免登录接口白名单 */
  whiteList: ['/login'],

  // ------ 跟布局相关 ---------
  /** 控制 settings panel 显示 */
  showSettings: true,
  /** 如果为真，将固定 header */
  showSidebarLogo: true,
  /** 控制 换肤按钮 显示 */
  showThemeSwitch: true,

  // ------ 在本地设置了路由配置的白名单 ---------
  staticRouteWhites: [
    'Ureport',
    'Jmreport',
    'JmreportDesigner',
    'External',
    'VoucherView'
  ],

  // ------ 文件压缩相关 ---------
  fileCompress: {
    size: 1024,
    quality: 0.4
  },

  // ------ 业务相关 ---------
  // 品牌为空时显示默认值
  defaultProductBrandEmpty: '无牌',
  // 归类信息如果是一下字段，值直接显示为 defaultProductBrandEmpty
  productBrandNothings: ['无', '无牌', '无品牌'],
  // 品牌为空时显示默认值
  defaultProductModelEmpty: '无型',
  // 归类信息如果是一下字段，值直接显示为 defaultProductModelEmpty
  productModelNothings: ['无', '无型', '无型号']
}
