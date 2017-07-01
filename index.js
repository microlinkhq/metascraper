'use strict'

const rules = require('req-all')('./src/rules')
const reduce = require('lodash.reduce')
const cheerio = require('cheerio')

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
  const html = cheerio.load(rawHtml, {
    lowerCaseAttributeNames: true
  })

  return reduce(rules, (acc, conditions, ruleName) => {
    const value = getValue(html, conditions)
    // TODO: Avoid response nil values
    if (isValid(value)) acc[ruleName] = value
    else acc[ruleName] = null
    return acc
  }, {})
}
