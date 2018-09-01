'use strict'

const { lang } = require('@metascraper/helpers')

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return lang(value)
}

module.exports = () => ({
  lang: [
    wrap($ => $('meta[property="og:locale"]').attr('content')),
    wrap($ => $('html').attr('lang'))
  ]
})
