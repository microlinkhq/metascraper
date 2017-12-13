'use strict'

const rules = require('req-all')('./rules')
const { reduce, find, isEmpty } = require('lodash')

const getValue = ({ htmlDom, url, conditions }) => {
  const size = conditions.length
  let index = -1
  let value

  while (isEmpty(value) && index++ < size - 1) {
    value = conditions[index](htmlDom, url)
  }

  return value
}

const getPluginsMetadata = ({ plugins, htmlDom, meta, url }) => {
  const connector = find(plugins, plugin => plugin.test({ htmlDom, meta, url }))
  return connector && connector({ htmlDom, meta, url })
}

const getMetadata = ({ rules, htmlDom, url }) =>
  reduce(
    rules,
    (acc, conditions, propName) => {
      const value = getValue({ htmlDom, url, conditions })
      acc[propName] = !isEmpty(value) ? value : null
      return acc
    },
    {}
  )

const getData = async ({ plugins, rules, htmlDom, url }) => {
  const meta = getMetadata({ rules, htmlDom, url })
  const pluginData = await getPluginsMetadata({ plugins, htmlDom, url, meta })
  return Object.assign({}, meta, pluginData)
}

module.exports = { getData, rules }
