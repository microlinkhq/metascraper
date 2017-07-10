'use strict'

const reduce = require('lodash.reduce')
const {ensureAsync} = require('async')
const {promisify} = require('util')

const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props} = getData

const getMetaData = ensureAsync(({url, html}, cb) => {
  const htmlDom = loadHtml(html)

  const output = reduce(props, (acc, conditions, propName) => {
    const value = getData({htmlDom, url, conditions})
    // TODO: Avoid response nil values
    acc[propName] = value
    return acc
  }, {})

  return cb(null, output)
})

const getMetaDataPromise = promisify(getMetaData)

module.exports = ({url, html}, cb) => (
  cb ? getMetaData({url, html}, cb) : getMetaDataPromise({url, html})
)
