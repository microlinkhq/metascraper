'use strict'

const { cloneDeep, concat, first, findIndex, forEach, chain } = require('lodash')

module.exports = (rules, baseRules) =>
  chain(rules)
    .reduce((acc, rules) => {
      forEach(rules, (rule, propName) => {
        // find the rules associated with `propName`
        const index = findIndex(acc, item => first(item) === propName)
        // if `propName` has more rule, add the new rule from the end
        if (index !== -1) acc[index][1] = concat(rule, ...acc[index][1])
        // otherwise, create an array of rules
        else acc.push([propName, rule])
      })
      return acc
    }, cloneDeep(baseRules))
    .value()
