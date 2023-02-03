import BaseSvgIcon from './src'

// 导入全部svg
const req = require.context('@/icons/svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

export default BaseSvgIcon
