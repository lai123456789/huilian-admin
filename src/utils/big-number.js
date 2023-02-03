/**
 *  用于运算数值基于(bignumber.js)[https://mikemcl.github.io/bignumber.js/]
 *  加法 .plus(n [, base]) ⇒ BigNumber
 *  减法 .minus(n [, base]) ⇒ BigNumber
 *  乘法 .times(n [, base]) ⇒ BigNumber
 *  除法 .div(n [, base]) ⇒ BigNumber
 *  取模/取余： .mod(n [, base])
 *  new BigNumber(0.1).plus(0.2).plus(0.3).toNumber() => number 0.6
 *  new BigNumber(0.1).plus(0.2).plus(0.3).toString() => string 0.6
 *  dp() 和 toFixed() 都是保留小数的，区别是前面的位数不够不会补0，而后面的会补0 toFormat也可以保留小数，但是会补0， 所以建议用dp()
 *  toFormat() 不要传任何参数，直接调用
 *  使用范式: new BigNumber(10000.1).plus(9876.2).plus(0.311).dp(2).toFormat() => 19,876.61
 */

import BigNumber from 'bignumber.js'

const format = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
}
BigNumber.config({ FORMAT: format })

export default BigNumber
