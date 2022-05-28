'use strict'

const { lang, toRule } = require('@metascraper/helpers')

const toLang = toRule(lang)

module.exports = () => ({
  lang: [
    toLang($ => $('meta[property="og:locale"]').prop('content')),
    toLang($ => $('meta[itemprop="inLanguage"]').prop('content')),
    toLang($ => $('html').prop('lang'))
  ]
})
