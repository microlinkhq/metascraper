'use strict'

const {isEmpty, reduce} = require('lodash')
const {ensureAsync} = require('async')
const {promisify} = require('util')

const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props, getConnector} = getData

const getMetaData = ensureAsync(({url, html}, cb) => {
  const htmlDom = loadHtml(html)

  const value = reduce(props, (acc, conditions, propName) => {
    const data = getData({htmlDom, url, conditions})
    acc[propName] = !isEmpty(data) ? data : null
    return acc
  }, {})

  const connector = getConnector({htmlDom, url})
  return cb(null, Object.assign({}, value, connector))
})

const getMetaDataPromise = promisify(getMetaData)

module.exports = ({url, html}, cb) => (
  cb ? getMetaData({url, html}, cb) : getMetaDataPromise({url, html})
)
