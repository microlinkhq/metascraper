'use strict'

const { has, set, concat, forEach, chain } = require('lodash')

module.exports = rulesBundle =>
  chain(rulesBundle)
    .reduce((acc, rules) => {
      forEach(rules, function (innerRules, propName) {
        if (rulesBundle.test) {
          forEach(innerRules, rule => (rule.test = rulesBundle.test))
        }

        set(
          acc,
          propName,
          has(acc, propName)
            ? concat(acc[propName], innerRules)
            : concat(innerRules)
        )

        return acc
      })
      return acc
    }, {})
    .toPairs()
    .value()
