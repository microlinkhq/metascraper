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
  const result = {}

  // Helper function to determine if a property should be included
  const shouldIncludeProp = propName => {
    if (pickPropNames && pickPropNames.size > 0) {
      return pickPropNames.has(propName)
    }
    return !omitPropNames.has(propName)
  }

  // Process base rules first (shallow clone arrays only)
  for (const [propName, ruleArray] of baseRules) {
    if (shouldIncludeProp(propName)) {
      result[propName] = [...ruleArray] // Shallow clone array
    }
  }

  // Handle case where rules might be null/undefined or not an array
  if (!rules || !Array.isArray(rules)) {
    return Object.entries(result)
  }

  // Process inline rules
  for (const { test, ...ruleSet } of rules) {
    for (const [propName, innerRules] of Object.entries(ruleSet)) {
      if (!shouldIncludeProp(propName)) continue

      const processedRules = Array.isArray(innerRules)
        ? [...innerRules]
        : [innerRules]
      if (test) {
        for (const rule of processedRules) {
          rule.test = test
        }
      }

      if (result[propName]) {
        // Prepend new rules to match original concat(innerRules, existing) behavior
        result[propName] = [...processedRules, ...result[propName]]
      } else {
        result[propName] = processedRules
      }
    }
  }

  return Object.entries(result)
}

module.exports = { mergeRules, loadRules }
