'use strict'

const { flow, chain, first, concat, toNumber, split } = require('lodash')
const { getUrl, isUrl } = require('@metascraper/helpers')

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
      const domNode = $(tag).get()
      const selectors = getDomNodeSizes(domNode, attr)
      return concat(acc, selectors)
    }, [])
    .sortBy(({ size }) => -size)
    .value()

const sizeSelectors = [
  { tag: 'link[rel="apple-touch-icon"]', attr: 'href' },
  { tag: 'link[rel="apple-touch-icon-precomposed"]', attr: 'href' },
  { tag: 'meta[name="msapplication-TileImage"]', attr: 'content' },
  { tag: 'link[rel="icon"]', attr: 'href' },
  { tag: 'link[rel="shortcut icon"]', attr: 'href' }
]

const validator = (value, url) => isUrl(value) && getUrl(url, value)

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return validator(value, url)
}

/**
 * Rules.
 */

module.exports = () => ({
  logo: [
    wrap($ => $('meta[property="og:logo"]').attr('content')),
    wrap($ => $('meta[itemprop="logo"]').attr('content')),
    wrap($ => $('img[itemprop="logo"]').attr('src')),
    wrap($ => {
      const sizes = getSizes($, sizeSelectors)
      const size = chain(sizes).first().get('link').value()
      return size
    })
  ]
})

module.exports.validator = validator
