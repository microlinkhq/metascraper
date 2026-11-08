'use strict'

const debug = require('debug-logfmt')('metascraper:get-data')
const { findRule, has } = require('@metascraper/helpers')

const PRINTABLE_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'bigint',
  'undefined'
])

const formatValue = value =>
  value === null || PRINTABLE_TYPES.has(typeof value) ? value : typeof value

const getData = async ({ rules, ...props }) => {
  const data = {}

  await Promise.all(
    rules.map(async ([propName, innerRules]) => {
      const duration = debug.duration()
      let normalizedValue = null
      let status = 'ok'

      try {
        const value = await findRule(innerRules, props, propName)
        normalizedValue = has(value) ? value : null
      } catch (error) {
        status = 'error'
        debug('rule:error', {
          propName,
          rules: innerRules.length,
          errorName: error?.name,
          errorMessage: error?.message
        })
      }

      duration(
        `${propName}=${formatValue(normalizedValue)} rules=${
          innerRules.length
        } status=${status}`
      )
      data[propName] = normalizedValue
    })
  )

  return data
}

module.exports = getData
