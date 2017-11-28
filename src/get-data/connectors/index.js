'use strict'

const reqAll = require('req-all')
const {find, flatten} = require('lodash')

const domains = flatten(reqAll('./domains'))

module.exports = ({htmlDom, url}) => {
  const connector = find(domains, domain => domain.test(url))
  return connector && connector(({htmlDom, url}))
}
