'use strict'

const {
  cloneDeep,
  concat,
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

const mergeRules = (rules, baseRules, omitProps = new Set()) => {
  const filteredBaseRules = baseRules.filter(
    ([propName]) => !omitProps.has(propName)
  )
  const rulesMap = new Map(cloneDeep(filteredBaseRules))
  return chain(rules)
    .reduce((acc, { test, ...rules }) => {
      forEach(rules, (innerRules, propName) => {
        if (omitProps.has(propName)) return
        if (test) forEachRule(innerRules, rule => (rule.test = test))
        if (rulesMap.has(propName)) {
          rulesMap.set(propName, concat(innerRules, rulesMap.get(propName)))
        } else {
          rulesMap.set(propName, castArray(innerRules))
        }
      })
      return acc
    }, rulesMap)
    .thru(map => Array.from(map.entries()))
    .value()
}

module.exports = { mergeRules, loadRules }
