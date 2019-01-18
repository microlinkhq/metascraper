'use strict'

const { isEmpty } = require('lodash')
const pReduce = require('p-reduce')
const xss = require('xss')

const getValue = async ({ htmlDom, url, conditions, meta }) => {
  const size = conditions.length
  let index = -1
  let value

  while (isEmpty(value) && index++ < size - 1) {
    value = await conditions[index]({ htmlDom, url, meta })
  }

  return value
}

const getData = ({ rules, htmlDom, url, escape }) =>
  pReduce(
    rules,
    async (acc, [propName, conditions]) => {
      const value = await getValue({ htmlDom, url, conditions, meta: acc })
      acc[propName] = !isEmpty(value) ? (escape ? xss(value) : value) : null
      return acc
    },
    {}
  )

module.exports = getData
