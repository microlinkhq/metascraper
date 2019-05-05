'use strict'

const { map, fromPairs, isEmpty, isArray } = require('lodash')
const xss = require('xss')

const getValue = async ({ htmlDom, url, conditions, meta }) => {
  const lastIndex = conditions.length
  let index = 0
  let value

  while (isEmpty(value) && index < lastIndex) {
    value = await conditions[index++]({ htmlDom, url, meta })
  }

  return value
}

const escapeValue = (value, { escape }) => {
  if (!escape) return value
  return isArray(value) ? map(value, xss) : xss(value)
}

const getData = async ({ rules, htmlDom, url, escape }) => {
  const data = await Promise.all(
    map(rules, async ([propName, conditions]) => {
      const rawValue = await getValue({ htmlDom, url, conditions })
      const value = isEmpty(rawValue) ? null : escapeValue(rawValue, { escape })
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
