'use strict'

const {
  map,
  fromPairs,
  isEmpty,
  isObject,
  isArray,
  mapValues
} = require('lodash')

const xss = require('xss')

const noopTest = () => true

const getValue = async ({ htmlDom, url, rules, meta }) => {
  const lastIndex = rules.length
  let index = 0
  let value

  while (isEmpty(value) && index < lastIndex) {
    const rule = rules[index++]
    const test = rule.test || noopTest
    if (test({ htmlDom, url, meta })) {
      value = await rule({ htmlDom, url, meta })
    }
  }

  return value
}

const mapValuesDeep = (object, fn) => {
  if (isArray(object)) {
    return map(object, innerObject => mapValuesDeep(innerObject, fn))
  }

  if (isObject(object)) {
    return mapValues(object, value => mapValuesDeep(value, fn))
  }

  return fn(object)
}

const escapeValue = (value, { escape }) =>
  !escape ? value : mapValuesDeep(value, xss)

const getData = async ({ rules, htmlDom, url, escape }) => {
  const data = await Promise.all(
    map(rules, async ([propName, innerRules]) => {
      const rawValue = await getValue({ htmlDom, url, rules: innerRules })
      const value = isEmpty(rawValue) ? null : escapeValue(rawValue, { escape })
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
