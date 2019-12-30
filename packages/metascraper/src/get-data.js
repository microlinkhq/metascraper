'use strict'

const { map, fromPairs } = require('lodash')
const { has } = require('@metascraper/helpers')

const truthyTest = () => true

const getValue = async ({ htmlDom, url, rules, meta, ...props }) => {
  const lastIndex = rules.length
  let index = 0
  let value

  do {
    const rule = rules[index++]
    const test = rule.test || truthyTest

    if (test({ htmlDom, url, meta })) {
      value = await rule({ htmlDom, url, meta, ...props })
    }
  } while (!has(value) && index < lastIndex)

  return value
}

const normalizeValue = value => (has(value) ? value : null)

const getData = async ({ rules, htmlDom, url, ...props }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const value = await getValue({
        htmlDom,
        url,
        rules: innerRules,
        ...props
      })
      return [propName, normalizeValue(value)]
    })
  )

  return fromPairs(data)
}

module.exports = getData
