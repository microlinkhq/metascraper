'use strict'

const {isEmpty, reduce} = require('lodash')
const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props, getConnector} = getData

module.exports = async ({url, html}) => {
  const htmlDom = loadHtml(html)

  const value = reduce(props, (acc, conditions, propName) => {
    const data = getData({htmlDom, url, conditions})
    acc[propName] = !isEmpty(data) ? data : null
    return acc
  }, {})

  const connector = await getConnector({htmlDom, url})
  return Object.assign({}, value, connector)
}
