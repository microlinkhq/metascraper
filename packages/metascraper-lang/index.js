'use strict'

const { lang, wrapRule } = require('@metascraper/helpers')

const toLang = wrapRule(lang)

module.exports = () => ({
  lang: [
    toLang($ => $('meta[property="og:locale"]').attr('content')),
    toLang($ => $('meta[itemprop="inLanguage"]').attr('content')),
    toLang($ => $('html').attr('lang'))
  ]
})
