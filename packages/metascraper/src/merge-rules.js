'use strict'

const { cloneDeep, concat, first, findIndex, forEach, chain } = require('lodash')

module.exports = (rules, baseRules) => chain(rules)
  .reduce((acc, rules) => {
    forEach(rules, (rule, propName) => {
      const index = findIndex(acc, item => first(item) === propName)
      if (index !== -1) acc[index][1] = concat(acc[index][1], rule)
      else acc.push([propName, rule])
    })
    return acc
  }, cloneDeep(baseRules))
  .value()
