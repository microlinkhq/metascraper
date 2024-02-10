'use strict'

const { $jsonld, logo: logoFn, toRule } = require('@metascraper/helpers')
const { eq, get } = require('lodash')

const toLogoUrl = ($, propName) => {
  const logo = $jsonld(propName)($)
  const width = get(logo, 'width')
  const height = get(logo, 'height')
  return width && height && eq(width, height) && get(logo, 'url')
}

module.exports = ({ filter } = {}) => {
  const mapper = filter
    ? async value => {
      const result = logoFn(value)
      return typeof result === 'string' ? await filter(result) : result
    }
    : logoFn

  const toLogo = toRule(mapper)

  return {
    logo: [
      toLogo($ => $('meta[property="og:logo"]').attr('content')),
      toLogo($ => $('meta[itemprop="logo"]').attr('content')),
      toLogo($ => $('img[itemprop="logo"]').attr('src')),
      toLogo($ => toLogoUrl($, 'brand.logo')),
      toLogo($ => toLogoUrl($, 'organization.logo')),
      toLogo($ => toLogoUrl($, 'place.logo')),
      toLogo($ => toLogoUrl($, 'product.logo')),
      toLogo($ => toLogoUrl($, 'service.logo')),
      toLogo($ => toLogoUrl($, 'publisher.logo')),
      toLogo($ => toLogoUrl($, 'logo.url')),
      toLogo($ => toLogoUrl($, 'logo'))
    ]
  }
}
