'use strict'

const { reduce, isEmpty } = require('lodash')

const getValue = ({ htmlDom, url, conditions, meta }) => {
  const size = conditions.length
  let index = -1
  let value

  while (isEmpty(value) && index++ < size - 1) {
    value = conditions[index]({ htmlDom, url, meta })
  }

  return value
}

const getData = ({ rules, htmlDom, url }) =>
  reduce(
    rules,
    (acc, [propName, conditions]) => {
      const value = getValue({ htmlDom, url, conditions, meta: acc })
      acc[propName] = !isEmpty(value) ? value : null
      return acc
    },
    {}
  )

module.exports = getData
