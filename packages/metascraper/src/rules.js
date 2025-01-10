'use strict'

const {
  cloneDeep,
  concat,
  first,
  findIndex,
  forEach,
  chain,
  castArray,
  has,
  set
} = require('lodash')

const forEachRule = (collection, fn) => forEach(castArray(collection), fn)

const loadRules = rulesBundle =>
  chain(rulesBundle)
    .reduce((acc, { test, pkgName, ...rules }) => {
      forEach(rules, (innerRules, propName) => {
        forEachRule(innerRules, rule => {
          if (test) rule.test = test
          rule.pkgName = pkgName ?? 'uknown'
        })

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

const mergeRules = (rules, baseRules) =>
  chain(rules)
    .reduce((acc, { test, ...rules }) => {
      forEach(rules, (innerRules, propName) => {
        if (test) forEachRule(innerRules, rule => (rule.test = test))
        // find the rules associated with `propName`
        const index = findIndex(acc, item => first(item) === propName)
        // if `propName` has more rule, add the new rule from the end
        if (index !== -1) acc[index][1] = concat(innerRules, ...acc[index][1])
        // otherwise, create an array of rules
        else acc.push([propName, castArray(innerRules)])
      })
      return acc
    }, cloneDeep(baseRules))
    .value()

module.exports = { mergeRules, loadRules }
