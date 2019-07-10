'use strict'

const {
  cloneDeep,
  concat,
  first,
  findIndex,
  forEach,
  chain
} = require('lodash')

const noopTest = () => true

module.exports = (rules, baseRules) =>
  chain(rules)
    .reduce((acc, { test = noopTest, ...rules }) => {
      forEach(rules, (innerRules, propName) => {
        forEach(innerRules, rule => (rule.test = test))

        // find the rules associated with `propName`
        const index = findIndex(acc, item => first(item) === propName)
        // if `propName` has more rule, add the new rule from the end
        if (index !== -1) acc[index][1] = concat(innerRules, ...acc[index][1])
        // otherwise, create an array of rules
        else acc.push([propName, innerRules])
      })
      return acc
    }, cloneDeep(baseRules))
    .value()
