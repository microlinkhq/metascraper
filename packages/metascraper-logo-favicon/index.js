'use strict'

const { flow, first, toNumber, split, chain, concat } = require('lodash')
const { resolve: resolveUrl, URL } = require('url')
const { url: urlFn } = require('@metascraper/helpers')
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

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return urlFn(value, { url })
}

/**
 * Rules.
 */
module.exports = () => ({
  logo: [
    wrap($ => {
      const sizes = getSizes($, sizeSelectors)
      const size = chain(sizes)
        .first()
        .get('link')
        .value()
      return size
    }),
    async ({ url }) => {
      const { origin } = new URL(url)
      const logoUrl = resolveUrl(origin, 'favicon.ico')

      try {
        await got.head(logoUrl)
        return logoUrl
      } catch (err) {
        return null
      }
    }
  ]
})
