// 基于el-message消息提示的封装
// 重置message，防止重复点击重复弹出message弹框

// 这里可以配置对应信息提示狂框的配置项
const config = {
  success: {
    showClose: true,
    duration: 3000,
    message: '操作成功！'
  },
  warning: {
    showClose: true,
    duration: 3000
  },
  error: {
    showClose: true,
    duration: 3000
  }
}

import { Message } from 'element-ui'
let messageInstance = null
const resetMessage = (options) => {
  if (messageInstance) {
    messageInstance.close()
  }
  messageInstance = Message(Object.assign({ customClass: 'scp-message' }, options))
  return messageInstance
}

  ;['error', 'success', 'info', 'warning'].forEach(type => {
    resetMessage[type] = options => {
      if (options === void 0) {
        options = { ...config[type] }
      }

      if (typeof options === 'string') {
        options = {
          ...config[type],
          message: options
        }
      }
      options.type = type
      return resetMessage(options)
    }
  })

export const message = resetMessage

