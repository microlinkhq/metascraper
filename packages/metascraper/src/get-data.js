'use strict'

const { isString, map, fromPairs } = require('lodash')
const { has } = require('@metascraper/helpers')
const mapValuesDeep = require('map-values-deep')
const xss = require('xss')

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

const escapeValue = (value, { escape }) => {
  if (!has(value)) return null
  if (!escape) return value
  return mapValuesDeep(value, value => (isString(value) ? xss(value) : value))
}

const getData = async ({ rules, htmlDom, url, escape }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const value = escapeValue(
        await getValue({ htmlDom, url, rules: innerRules }),
        { escape }
      )
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
