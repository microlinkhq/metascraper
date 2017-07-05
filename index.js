'use strict'

const reduce = require('lodash.reduce')

const getData = require('./src/get-data')
const loadHtml = require('./src/html')
const {props} = getData

module.exports = rawHtml => {
  const html = loadHtml(rawHtml)

  return reduce(props, (acc, conditions, propName) => {
    const value = getData(html, conditions)
    // TODO: Avoid response nil values
    acc[propName] = value
    return acc
  }, {})
}
