'use strict'

const { logo, parseUrl, toRule } = require('@metascraper/helpers')
const createGetLogo = require('bimi-url')

const toLogo = toRule(logo)

module.exports = options => {
  const getLogo = createGetLogo(options)

  const rules = {
    logo: [toLogo((_, url) => getLogo(parseUrl(url).domain))]
  }

  rules.pkgName = 'metascraper-logo-bimi'

  return rules
}

module.exports.createGetLogo = createGetLogo
module.exports.resolveLogoUrl = createGetLogo.resolveLogoUrl
module.exports.toLogoUrl = createGetLogo.toLogoUrl
