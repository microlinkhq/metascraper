'use strict'

const { map, fromPairs, isEmpty } = require('lodash')

const getValue = async ({ htmlDom, url, conditions, meta }) => {
  const lastIndex = conditions.length
  let index = 0
  let value

  while (isEmpty(value) && index < lastIndex) {
    value = await conditions[index++]({ htmlDom, url, meta })
  }

  return value
}

const getData = async ({ rules, htmlDom, url }) => {
  const data = await Promise.all(
    map(rules, async ([propName, conditions]) => {
      const value = await getValue({ htmlDom, url, conditions })
      return [propName, !isEmpty(value) ? value : null]
    })
  )

  return fromPairs(data)
}

module.exports = getData
