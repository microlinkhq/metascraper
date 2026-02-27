'use strict'

const castArray = value => (Array.isArray(value) ? value : [value])

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
        acc[propName] = processedRules
      }
    }
  }
  return Object.entries(acc)
}

const mergeRules = (
  rules,
  baseRules,
  omitPropNames = new Set(),
  pickPropNames
) => {
  const hasPickProps = Boolean(pickPropNames && pickPropNames.size > 0)
  const hasOmittedProps = Boolean(omitPropNames && omitPropNames.size > 0)
  const hasInlineRules = Array.isArray(rules) && rules.length > 0

  if (!hasPickProps && !hasOmittedProps && !hasInlineRules) {
    return baseRules
  }

  const result = {}

  const shouldIncludeProp = propName => {
    if (hasPickProps) {
      return pickPropNames.has(propName)
    }
    return !omitPropNames.has(propName)
  }

  for (const [propName, ruleArray] of baseRules) {
    if (shouldIncludeProp(propName)) {
      result[propName] = ruleArray
    }
  }

  if (!hasInlineRules) {
    return Object.entries(result)
  }

  for (const { test, ...ruleSet } of rules) {
    for (const [propName, innerRules] of Object.entries(ruleSet)) {
      if (!shouldIncludeProp(propName)) continue

      const processedRules = castArray(innerRules)
      if (test) {
        for (const rule of processedRules) {
          rule.test = test
        }
      }

      if (result[propName]) {
        result[propName] = processedRules.concat(result[propName])
      } else {
        result[propName] = processedRules
      }
    }
  }

  return Object.entries(result)
}

module.exports = { mergeRules, loadRules }
