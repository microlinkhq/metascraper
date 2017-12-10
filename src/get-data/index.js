'use strict'

const rules = require('req-all')('./rules')
const { isEmpty } = require('lodash')

module.exports = ({ htmlDom, url, conditions }) => {
  const size = conditions.length
  let index = -1
  let value

  while (isEmpty(value) && index++ < size - 1) {
    value = conditions[index](htmlDom, url)
  }

  return value
}

module.exports.props = rules
module.exports.getConnector = require('./connectors')
