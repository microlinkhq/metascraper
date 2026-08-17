'use strict'

const { $meta, lang, toRule } = require('@metascraper/helpers')

const toLang = toRule(lang)

module.exports = () => {
  const rules = {
    lang: [
      toLang($meta('og:locale')),
      toLang($ => $('meta[itemprop="inLanguage"]').attr('content')),
      toLang($ => $('html').attr('lang'))
    ]
  }

  rules.pkgName = 'metascraper-lang'

  return rules
}
