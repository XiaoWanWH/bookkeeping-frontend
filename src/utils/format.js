/**
 * 金额格式化
 * @param {number} amount 金额
 * @param {number} decimals 小数位数，默认2
 * @returns {string} 格式化后的金额字符串
 */
export function formatMoney(amount, decimals = 2) {
  if (amount === null || amount === undefined) return '0.00'
  const num = Number(amount)
  if (isNaN(num)) return '0.00'
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 日期格式化
 * @param {string|Date} date 日期
 * @param {string} format 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取优先级文本
 * @param {number|string} priority 优先级
 * @returns {string} 优先级文本
 */
export function getPriorityText(priority) {
  const map = {
    1: '低',
    2: '中',
    3: '高'
  }
  return map[priority] || '未知'
}

/**
 * 获取优先级对应的 Element Plus Tag 类型
 * @param {number|string} priority 优先级
 * @returns {string} Tag 类型
 */
export function getPriorityType(priority) {
  const map = {
    1: 'info',
    2: 'warning',
    3: 'danger'
  }
  return map[priority] || 'info'
}
