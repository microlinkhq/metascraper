'use strict'

const debug = require('debug-logfmt')('metascraper:get-data')
const { findRule, has } = require('@metascraper/helpers')

const getData = async ({ rules, ...props }) => {
  const data = {}
  const tasks = []

  for (const [propName, innerRules] of rules) {
    // Predeclare keys to preserve deterministic insertion order.
    data[propName] = null

    tasks.push(
      (async () => {
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
          `${propName}=${normalizedValue} rules=${innerRules.length} status=${status}`
        )
        data[propName] = normalizedValue
      })()
    )
  }

  await Promise.all(tasks)

  return data
}

module.exports = getData
