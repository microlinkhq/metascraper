'use strict'

const { map, fromPairs } = require('lodash')
const { findRule, has } = require('@metascraper/helpers')

const normalizeValue = value => (has(value) ? value : null)

const getData = async ({ rules, ...props }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const value = await findRule(innerRules, props)
      return [propName, normalizeValue(value)]
    })
  )

  return fromPairs(data)
}

module.exports = getData
