'use strict'

const debug = require('debug-logfmt')('metascraper:get-data')
const { findRule, has } = require('@metascraper/helpers')

const getData = async ({ rules, ...props }) => {
  const data = await Promise.all(
    rules.map(async ([propName, innerRules]) => {
      const duration = debug.duration()
      const value = await findRule(innerRules, props, propName)
      const normalizedValue = has(value) ? value : null
      duration(`${propName}=${normalizedValue} rules=${innerRules.length}`)
      return [propName, normalizedValue]
    })
  )

  return Object.fromEntries(data)
}

module.exports = getData
