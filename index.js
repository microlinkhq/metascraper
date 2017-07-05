'use strict'

const cb2promise = require('cb2promise')
const reduce = require('lodash.reduce')
const {ensureAsync} = require('async')

const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props} = getData

const getMetaData = ensureAsync((rawHtml, cb) => {
  const html = loadHtml(rawHtml)

  const output = reduce(props, (acc, conditions, propName) => {
    const value = getData(html, conditions)
    // TODO: Avoid response nil values
    acc[propName] = value
    return acc
  }, {})

  return cb(null, output)
})

module.exports = (html, cb) => {
  return cb
    ? getMetaData(html, cb)
    : cb2promise(getMetaData, html)
}
