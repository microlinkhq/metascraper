'use strict'

const { has, set, concat, forEach, chain } = require('lodash')

module.exports = rulesBundle =>
  chain(rulesBundle)
    .reduce((acc, { test, ...rules }) => {
      forEach(rules, function (innerRules, propName) {
        if (test) forEach(innerRules, rule => (rule.test = test))

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
