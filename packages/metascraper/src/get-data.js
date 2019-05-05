'use strict'

const { map, fromPairs, isEmpty } = require('lodash')
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

const getData = async ({ rules, htmlDom, url, escape }) => {
  const data = await Promise.all(
    map(rules, async ([propName, conditions]) => {
      const rawValue = await getValue({ htmlDom, url, conditions })
      const value = isEmpty(rawValue) ? null : escape ? xss(rawValue) : rawValue
      return [propName, value]
    })
  )

  return fromPairs(data)
}

module.exports = getData
