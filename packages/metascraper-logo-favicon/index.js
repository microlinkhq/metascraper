'use strict'

const {
  absoluteUrl,
  logo,
  url: urlFn,
  toRule
} = require('@metascraper/helpers')

const { flow, first, toNumber, split, chain, concat } = require('lodash')
const { URL } = require('url')
const got = require('got')

const getSize = flow([str => split(str, 'x'), first, toNumber])

const getDomNodeSizes = (domNodes, attr) =>
  chain(domNodes)
    .map(({ attribs }) => ({
      size: getSize(attribs.sizes),
      link: attribs[attr]
    }))
    .value()

const getSizes = ($, collection) =>
  chain(collection)
    .reduce((acc, { tag, attr }) => {
      const domNodes = $(tag).get()
      const selectors = getDomNodeSizes(domNodes, attr)
      return concat(acc, selectors)
    }, [])
    .sortBy(({ size }) => -size)
    .value()

const sizeSelectors = [
  { tag: 'link[rel*="apple-touch-icon"]', attr: 'href' },
  { tag: 'meta[name*="msapplication-tileimage" i]', attr: 'content' },
  { tag: 'link[rel="icon"]', attr: 'href' },
  { tag: 'link[rel="shortcut icon"]', attr: 'href' }
]

const toUrl = toRule(urlFn)

const DEFAULT_GOT_OPTS = {
  timeout: 3000
}

/**
 * Rules.
 */
module.exports = ({ gotOpts } = {}) => ({
  logo: [
    toUrl($ => {
      const sizes = getSizes($, sizeSelectors)
      const size = chain(sizes)
        .first()
        .get('link')
        .value()
      return size
    }),
    async ({ url }) => {
      const logoUrl = absoluteUrl(new URL(url).origin, 'favicon.ico')
      try {
        await got.head(logoUrl, {
          ...DEFAULT_GOT_OPTS,
          ...gotOpts
        })
        return logo(logoUrl)
      } catch (err) {
        return null
      }
    }
  ]
})
