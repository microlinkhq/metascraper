'use strict'

const { isString, toLower } = require('lodash')

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && toLower(value.substring(0, 2))
}

module.exports = () => ({
  lang: [
    wrap($ => $('meta[property="og:locale"]').attr('content')),
    wrap($ => $('html').attr('lang'))
  ]
})
