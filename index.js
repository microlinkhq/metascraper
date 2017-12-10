'use strict'

const { isEmpty, reduce } = require('lodash')
const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const { isUrl } = require('./src/util')

const { props, getConnector } = getData

module.exports = async ({ url, html } = {}) => {
  if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
  if (isEmpty(html)) { throw new TypeError('You need to provide a valid HTML markup.') }

  const htmlDom = loadHtml(html)

  const value = reduce(
    props,
    (acc, conditions, propName) => {
      const data = getData({ htmlDom, url, conditions })
      acc[propName] = !isEmpty(data) ? data : null
      return acc
    },
    {}
  )

  const connector = await getConnector({ htmlDom, url })
  return Object.assign({}, value, connector)
}
