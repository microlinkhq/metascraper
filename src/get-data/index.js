'use strict'

const rules = require('req-all')('./rules')

const isValid = result => result !== null && result !== undefined && result !== ''

const getValue = ($, conditions) => {
  const size = conditions.length
  let index = -1
  let value = null

  while (!isValid(value) && index++ < size - 1) {
    value = conditions[index]($)
  }
  return value
}

const getData = ($, conditions) => {
  const data = getValue($, conditions)
  return isValid(data) ? data : null
}

getData.props = rules

module.exports = getData
