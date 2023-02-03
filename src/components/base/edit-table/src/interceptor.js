import VXETable from 'vxe-table'

VXETable.setup({
  zIndex: 999999
})

  ; (() => {
    VXETable.interceptor.mixin({
      'event.clearActived': () => {
        return false
      }
    })
  })()
