'use strict'

const { stringify } = require('querystring')
const { isEmpty } = require('lodash')

module.exports = query => (isEmpty(query) ? '' : `?${stringify(query)}`)
