var ACCESS_TOKEN = 'scp-access_token'

var UREPORT_CONFIG = {
  url: '/ureport/pdf',
  reportType: '0'
}

var JMREPORT_CONFIG = {
  url: '/jmreport/exportPdfStream',
  reportType: '1'
}

var authorizationObj = localStorage.getItem(ACCESS_TOKEN)
var authorization = ''
if (authorizationObj) {
  authorization = 'Bearer' + JSON.parse(authorizationObj).content
}

 

window.onload = function () {
  var params = unserialize(window.location.search)
  request({
    url: window.origin + (params.reportType === UREPORT_CONFIG.reportType ? UREPORT_CONFIG.url : JMREPORT_CONFIG.url) + (params.reportType === UREPORT_CONFIG.reportType ? window.location.search : ''),
    type: params.reportType === UREPORT_CONFIG.reportType ? 'GET' : 'POST',
    data:{
      excelConfigId: params.reportId,
      queryParam:{
        token: authorization
      }
    },
    success(ev) {
      if (ev.target.status === 200) {
        const response = ev.target.response
        var blob = URL.createObjectURL(response); 
        PDFViewerApplication.open(blob)
      }
    }
  })

  const downloadBtn = document.getElementById('my_download')
  downloadBtn.onclick = function () {
    var params = unserialize(window.location.search)
    request({
      url: window.origin + (params.reportType === UREPORT_CONFIG.reportType ? UREPORT_CONFIG.url : JMREPORT_CONFIG.url) + (params.reportType === UREPORT_CONFIG.reportType ? window.location.search : ''),
      type: params.reportType === UREPORT_CONFIG.reportType ? 'GET' : 'POST',
      data:{
        excelConfigId: params.reportId,
        queryParam:{
          token: authorization
        }
      },
      success(ev) {
        if (ev.target.status === 200) {
          var response = ev.target.response
          var link = document.createElement('a')
          var url = URL.createObjectURL(new Blob([response]))
          link.href = url
          link.download = params._n + '.pdf'
          document.body.appendChild(link)
          link.click()
          window.setTimeout(function () {
            URL.revokeObjectURL(url)
            document.body.removeChild(link)
          }, 0)
        }
      }
    })
   
  }
}


/**
 * 序列化参数
 * @param {object} obj 参数对象
 * @returns {string} 返回序列化好的字符串
 */
//  function serialize(obj) {
//    if(JSON.stringify(obj) === '{}' || obj === null || obj === undefined){
//      return obj
//    }
//   var arr = []
//   for (var key in obj) { 
//     arr.push(`${key}=${encodeURIComponent(obj[key])}`)
//   }
//   return arr.join('&').replace(/%20/g, '+')
// }

/**
 * 反序列化参数
 * @param {string} query 参数字符串
 * @returns {object} 返回反序列化好的对象
 */
function unserialize(query) {
  var params = ''
  if(query.indexOf('?'>=0)){
    params = query.split('?')[1]
  } 
  var serializeQuerys = params.split('&')
  var serializeQueryObj = {}
  for (var i = 0; i < serializeQuerys.length; i++) {
    var serializeQuery = serializeQuerys[i]
    var serializeQueryStr = serializeQuery.split('=')
    serializeQueryObj[serializeQueryStr[0]] = decodeURI(serializeQueryStr[1])
  }
  return serializeQueryObj
}

 
/**
 * 请求方法
 * @param {object} args 请求所需的参数 
 */
function request(args) {
  var url = args.url || ''
  var type = args.type || 'GET'
  // var data = args.data || {}
  var responseType = args.responseType || 'blob'
  var contentType = args.contentType || 'application/json'
  // var params = serialize(data)


  var xhr = new XMLHttpRequest();
  xhr.responseType = responseType
  xhr.onload = function (ev) {
    if (args.success) {
      args.success(ev)
    }
  };
  xhr.open(type, url, true);
  xhr.setRequestHeader('Content-type', contentType)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  xhr.setRequestHeader('Authorization', authorization)
  xhr.send(type === 'POST' ? JSON.stringify(args.data): '');
}



