'use strict'

const reduce = require('lodash.reduce')

const rules = require('req-all')('./src/rules')
const loadHtml = require('./src/html')

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

module.exports = rawHtml => {
  const html = loadHtml(rawHtml)

  return reduce(rules, (acc, conditions, ruleName) => {
    const value = getValue(html, conditions)
    // TODO: Avoid response nil values
    if (isValid(value)) acc[ruleName] = value
    else acc[ruleName] = null
    return acc
  }, {})
}
