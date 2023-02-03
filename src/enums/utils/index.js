
export default function enums(enums) {
  const oField = {
    value: 0,
    label: 1,
    color: 2
  }

  const list = []
  for (const key in enums) {
    if (Object.hasOwnProperty.call(enums, key)) {
      const ele = enums[key]
      list.push({ key, value: ele[oField.value], label: ele[oField.label], color: ele[oField.color] })
    }
  }

  return {
    /** 根据 key 获取对应字段的值 */
    getFieldByKey(key, field = 'value') {
      return enums[key][oField[field]]
    },

    /** 根据 value 获取对应字段的值 */
    getFieldByValue(value, field = 'label') {
      const target = list.find(v => v.value === value)
      return target ? target[field] : value
    },

    /** 根据 label 获取对应字段的值 */
    getFieldByLabel(label, field) {
      const target = list.find(v => v.label === label)
      return target ? target[field] : label
    },

    /** 获取列表 */
    getList() {
      return Object.freeze(list)
    }
  }
}
