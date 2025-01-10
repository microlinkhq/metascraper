'use strict'

const debug = require('debug-logfmt')('metascraper:get-data')
const { findRule, has } = require('@metascraper/helpers')
const { map, fromPairs } = require('lodash')

const normalizeValue = value => (has(value) ? value : null)

const getData = async ({ rules, name, ...props }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const duration = debug.duration()
      const value = await findRule(innerRules, props, propName)
      const normalizedValue = normalizeValue(value)
      duration(`${propName}=${normalizedValue} rules=${innerRules.length}`)
      return [propName, normalizedValue]
    })
  )

  return fromPairs(data)
}

module.exports = getData
