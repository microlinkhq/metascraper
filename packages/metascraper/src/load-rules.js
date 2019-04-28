'use strict'

const { has, set, concat, forEach, chain } = require('lodash')

module.exports = rules =>
  chain(rules)
    .reduce((acc, rules) => {
      forEach(rules, function (innerRules, propName) {
        set(
          acc,
          propName,
          has(acc, propName) ? concat(acc[propName], innerRules) : concat(innerRules)
        )

        return acc
      })
      return acc
    }, {})
    .toPairs()
    .value()
