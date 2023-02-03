
import { isEmail, isMobileNo, isSocialCreditCode } from '.'

/** 校验邮箱格式是否正确 */
export function validEmail(rule, value, callback) {
  if (value && !isEmail(value)) {
    callback(rule.message || '输入邮箱格式不正确')
  } else {
    callback()
  }
}

/** 校验手机号格式是否正确 */
export function validPhone(rule, value, callback) {
  if (value && !isMobileNo(value)) {
    callback(rule.message || '输入手机号格式不正确')
  } else {
    callback()
  }
}

/** 校验统一社会信用代码是否正确 */
export function validSocialCreditCode(rule, value, callback) {
  if (!isSocialCreditCode(value)) {
    callback(rule.message || '输入统一社会信用代码的格式不正确')
  } else {
    callback()
  }
}

/** 校验数字必填 */
export const validatorNumRequired = (rule, value, callback) => {
  if ((!value || Number(value) === 0) && rule.required) {
    callback(rule.message)
  } else {
    callback()
  }
}

/** 校验金额格式是否正确 */
export const validAmount = (rule, value, callback) => {
  if (!/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(value)) {
    callback(rule.message || '金额输入不能小于0, 保留2位小数')
  } else {
    callback()
  }
}
