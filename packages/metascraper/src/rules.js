'use strict'

const { cloneDeep, concat, castArray, chain, forEach } = require('lodash')

const forEachRule = (collection, fn) => {
  const rules = castArray(collection)
  for (const rule of rules) {
    fn(rule)
  }
}

const loadRules = rulesBundle => {
  const acc = {}
  for (const { test, pkgName, ...rules } of rulesBundle) {
    for (const [propName, innerRules] of Object.entries(rules)) {
      const processedRules = castArray(innerRules)
      if (test || pkgName) {
        for (const rule of processedRules) {
          if (test) rule.test = test
          if (pkgName) rule.pkgName = pkgName ?? 'unknown'
        }
      }

      if (acc[propName]) {
        acc[propName].push(...processedRules)
      } else {
        acc[propName] = [...processedRules]
      }
    }
  }
  return Object.entries(acc)
}

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
