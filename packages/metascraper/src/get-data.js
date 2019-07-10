'use strict'

const { isNil, map, fromPairs } = require('lodash')
const mapValuesDeep = require('map-values-deep')
const hasValues = require('has-values')

const xss = require('xss')

const has = value =>
  isNil(value) || value === false || value === 0 || value === ''
    ? false
    : hasValues(value)

const noopTest = () => true

const getValue = async ({ htmlDom, url, rules, meta }) => {
  const lastIndex = rules.length
  let index = 0
  let value

  do {
    const rule = rules[index++]
    const test = rule.test || noopTest
    if (test({ htmlDom, url, meta })) {
      value = await rule({ htmlDom, url, meta })
    }
  } while (!has(value) && index < lastIndex)

  return value
}

const escapeValue = (value, { escape }) =>
  !escape ? value : mapValuesDeep(value, xss)

const getData = async ({ rules, htmlDom, url, escape }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const rawValue = await getValue({ htmlDom, url, rules: innerRules })
      const value = has(rawValue) ? escapeValue(rawValue, { escape }) : null
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
module.exports.has = has
