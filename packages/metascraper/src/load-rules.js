'use strict'

const { has, set, concat, forEach, chain } = require('lodash')

const noopTest = () => true

module.exports = rulesBundle =>
  chain(rulesBundle)
    .reduce((acc, { test = noopTest, ...rules }) => {
      forEach(rules, function (innerRules, propName) {
        forEach(innerRules, rule => (rule.test = test))

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
