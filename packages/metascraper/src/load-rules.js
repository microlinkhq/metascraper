'use strict'

const { concat, findIndex, forEach, chain } = require('lodash')

module.exports = rules =>
  chain(rules)
    // merge rules with same props
    .reduce((acc, rules) => {
      forEach(rules, function (rule, propName) {
        const index = findIndex(acc, item => item[propName])
        if (index !== -1) { acc[index][propName] = concat(acc[index][propName], rule) } else acc.push({ [propName]: concat(rule) })
      })
      return acc
    }, [])
    // export an array interface, it's easier to iterate
    .map(obj => {
      const key = Object.keys(obj)[0]
      const value = obj[key]
      return [key, value]
    })
    .value()
