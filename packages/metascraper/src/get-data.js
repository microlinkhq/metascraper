'use strict'

const { isString, map, fromPairs } = require('lodash')
const { hasValue } = require('@metascraper/helpers')
const mapValuesDeep = require('map-values-deep')

const xss = require('xss')

const noopTest = () => true

const getValue = async ({ htmlDom, url, rules, meta, ...props }) => {
  const lastIndex = rules.length
  let index = 0
  let value

  do {
    const rule = rules[index++]
    const test = rule.test || noopTest
    if (test({ htmlDom, url, meta })) {
      value = await rule({ htmlDom, url, meta, ...props })
    }
  } while (!hasValue(value) && index < lastIndex)

  return value
}

const escapeValue = (value, { escape }) =>
  !escape
    ? value
    : mapValuesDeep(value, value => (isString(value) ? xss(value) : value))

const getData = async ({ rules, htmlDom, url, escape, ...props }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const rawValue = await getValue({
        htmlDom,
        url,
        rules: innerRules,
        ...props
      })
      const value = hasValue(rawValue)
        ? propName !== 'iframe'
          ? escapeValue(rawValue, { escape })
          : rawValue
        : null
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
