'use strict'

const { isString, toLower } = require('lodash')

const validator = value => isString(value) && toLower(value.substring(0, 2))

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return validator(value)
}

module.exports = () => ({
  lang: [
    wrap($ => $('meta[property="og:locale"]').attr('content')),
    wrap($ => $('html').attr('lang'))
  ]
})

module.exports.validator = validator
