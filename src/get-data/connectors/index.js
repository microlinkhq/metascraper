'use strict'

const reqAll = require('req-all')
const {find} = require('lodash')

const domains = reqAll('./domains')

module.exports = ({htmlDom, url}) => {
  const connector = find(domains, domain => domain.test(url))
  return connector && connector(({htmlDom, url}))
}
