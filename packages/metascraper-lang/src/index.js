'use strict'

const { lang, toRule } = require('@metascraper/helpers')

const toLang = toRule(lang)

module.exports = () => {
  const rules = {
    lang: [
      toLang($ => $('meta[property="og:locale"]').attr('content')),
      toLang($ => $('meta[itemprop="inLanguage"]').attr('content')),
      toLang($ => $('html').attr('lang'))
    ]
  }

  rules.pkgName = 'metascraper-lang'

  return rules
}
