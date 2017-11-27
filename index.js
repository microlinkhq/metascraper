'use strict'

const {isEmpty, reduce} = require('lodash')
const {ensureAsync} = require('async')
const {promisify} = require('util')

const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props, getConnector} = getData

const getMetaData = ensureAsync(({url, html}, cb) => {
  const htmlDom = loadHtml(html)

  const output = reduce(props, (acc, conditions, propName) => {
    const value = Object.assign(
      getData({htmlDom, url, conditions}) || {},
      getConnector({htmlDom, url})
    )

    acc[propName] = !isEmpty(value) ? value : null
    return acc
  }, {})

  return cb(null, output)
})

const getMetaDataPromise = promisify(getMetaData)

module.exports = ({url, html}, cb) => (
  cb ? getMetaData({url, html}, cb) : getMetaDataPromise({url, html})
)
