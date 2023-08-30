'use strict'

const { $jsonld, url: urlFn, toRule } = require('@metascraper/helpers')
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
      const result = urlFn(value)
      return typeof result === 'string' ? await filter(result) : result
    }
    : urlFn

  const toUrl = toRule(mapper)

  return {
    logo: [
      toUrl($ => $('meta[property="og:logo"]').attr('content')),
      toUrl($ => $('meta[itemprop="logo"]').attr('content')),
      toUrl($ => $('img[itemprop="logo"]').attr('src')),
      toUrl($ => toLogoUrl($, 'brand.logo')),
      toUrl($ => toLogoUrl($, 'organization.logo')),
      toUrl($ => toLogoUrl($, 'place.logo')),
      toUrl($ => toLogoUrl($, 'product.logo')),
      toUrl($ => toLogoUrl($, 'service.logo')),
      toUrl($ => toLogoUrl($, 'publisher.logo')),
      toUrl($ => toLogoUrl($, 'logo.url')),
      toUrl($ => toLogoUrl($, 'logo'))
    ]
  }
}
