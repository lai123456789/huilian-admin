import { isNumber, isFunction, clone } from 'xe-utils'
import dayjs from '@/utils/day'
import BigNumber from '@/utils/big-number'

export function downloadExcel(data, tableColumn, dictObj, filename) {
  var formatterData = exportFormatter(data, tableColumn, dictObj)

  var tableHeader = handleTableHeader(tableColumn)

  var tHeader = ['序号'] // 添加数据序号
  var tHeaderFieds = ['$seqNo'] // 添加数据序号
  tableHeader.forEach(v => {
    tHeader.push(v.label)
    tHeaderFieds.push(v.field)
  })

  var _filename = getFilename(filename)
  var formatData = formatJson(tHeaderFieds, formatterData)

  return new Promise((resolve, reject) => {
    import('@/vendor/export2-excel').then(excel => {
      excel.export_json_to_excel({
        header: tHeader,
        data: formatData,
        filename: _filename,
        autoWidth: true,
        bookType: 'xlsx'// xlsx csv txt
      })
      formatterData = null
      tableHeader = null
      tHeader = null
      tHeaderFieds = null
      _filename = null
      formatData = null

      resolve(true)
    }).catch(() => {
      reject(false)
    })
  })
}

function handleTableHeader(tableColumn) {
  const tableHeaderCols = []
  tableColumn.forEach(col => {
    // 过滤掉需要隐藏的列
    if (!('visible' in col && !col.visible)) {
      return tableHeaderCols.push({
        label: col.title,
        field: col.field
      })
    }
  })
  return tableHeaderCols
}

function formatJson(filterVal, jsonData) {
  return jsonData.map(v => filterVal.map(j => v[j]))
}

function getFilename(filename) {
  if (filename) {
    return filename
  } else {
    const t = document.querySelector('.tags-view-container .tags-view-item.active')
    const text = t ? t.innerText : ''
    const sub = document.querySelector('.el-tabs__item.is-top.is-active')
    const subText = sub ? sub.innerText : '数据列表'
    const time = dayjs().format('YYYYMMDD')
    const conditionsLabel = ''
    const filename = `${text}-${subText}-${time}${conditionsLabel}`

    return filename
  }
}

function handleOptions(value, options = [], config = {}) {
  const target = options.find(v => v[config.valueKey || 'value'] === value)
  return target ? target[[config.labelKey || 'label']] : value
}

function exportFormatter(data, cloumns, dictObj) {
  const renderTextColumns = []
  const numberColumns = []
  const percentColumns = []
  const dateColumns = []
  const optionsColumns = []
  const formatterColumns = []
  let records = []

  for (let i = 0; i < cloumns.length; i++) {
    const column = cloumns[i]
    if (!('visible' in column && !column.visible)) {
      if (column.render && column.renderText) {
        renderTextColumns.push(column)
      } else if (column.formatter && column.formatter.type) {
        switch (column.formatter.type) {
          case 'number':
            numberColumns.push(column)
            break
          case 'percent':
            percentColumns.push(column)
            break
          case 'date':
            dateColumns.push(column)
            break
          case 'options':
            optionsColumns.push(column)
            break
        }
      } else if (column.formatter && isFunction(column.formatter)) {
        formatterColumns.push(column)
      }
    }
  }

  try {
    records = data.map((item, index) => {
      // 浅拷贝表格数据
      const record = clone(item)
      record.$seqNo = index + 1
      for (let i = 0; i < renderTextColumns.length; i++) {
        const columns = renderTextColumns[i]
        const formatterConfig = columns.renderText
        record[columns.field] = isFunction(formatterConfig) ? formatterConfig(item[columns.field], item, columns, dictObj[columns.field]) : formatterConfig
      }

      for (let i = 0; i < optionsColumns.length; i++) {
        const columns = optionsColumns[i]
        const formatterConfig = columns.formatter
        record[columns.field] = handleOptions(item[columns.field], dictObj[columns.field], formatterConfig.config)
      }

      for (let i = 0; i < numberColumns.length; i++) {
        const columns = numberColumns[i]
        const formatterConfig = columns.formatter
        record[columns.field] = isNumber(item[columns.field]) ? new BigNumber(item[columns.field]).dp((formatterConfig.config && formatterConfig.config.precision) || 2).toFormat(formatterConfig.config || {}) : item[columns.field]
      }

      for (let i = 0; i < dateColumns.length; i++) {
        const columns = dateColumns[i]
        const formatterConfig = columns.formatter
        record[columns.field] = dayjs(Number(item[columns.field])).format((formatterConfig.config && formatterConfig.config.valueFormat) || 'YYYY-MM-DD HH:mm:ss')
      }

      for (let i = 0; i < percentColumns.length; i++) {
        const columns = dateColumns[i]
        record[columns.field] = isNumber(Number(item[columns.field])) ? `${new BigNumber(Number(item[columns.field])).times(100)}%` : item[columns.field]
      }

      for (let i = 0; i < formatterColumns.length; i++) {
        const columns = formatterColumns[i]
        record[columns.field] = columns.formatter(item[columns.field], item, columns, dictObj[columns.field])
      }

      return record
    })
  } catch (error) {
    console.error('exportFormatter error', error)
  }

  return records
}

