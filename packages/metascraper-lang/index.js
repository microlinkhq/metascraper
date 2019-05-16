'use strict'

const { lang } = require('@metascraper/helpers')

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return lang(value)
}

const ld = rule => ({ jsonLd }) => {
  const value = rule(jsonLd)
  return lang(value)
}

module.exports = () => ({
  lang: [
    ld(ld => ld.inLanguage),
    wrap($ => $('meta[property="og:locale"]').attr('content')),
    wrap($ => $('meta[itemprop="inLanguage"]').attr('content')),
    wrap($ => $('html').attr('lang'))
  ]
})
