'use strict'

const isRelativeUrl = require('is-relative-url')
const sanetizeUrl = require('normalize-url')
const {flow, chain, first, isString, concat, toNumber, split} = require('lodash')
const {resolve: resolveUrl} = require('url')

const normalizeUrl = url => sanetizeUrl(url, {stripWWW: false})

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => (htmlDom, baseUrl) => {
  const value = rule(htmlDom)
  if (!isString(value)) return
  const url = isRelativeUrl(value) ? resolveUrl(baseUrl, value) : value
  return normalizeUrl(url)
}

const getSize = flow([str => split(str, 'x'), first, toNumber])

const getDomNodeSizes = (domNodes, attr) =>
  chain(domNodes)
  .map(({attribs}) => ({
    size: getSize(attribs.sizes),
    link: attribs[attr]
  }))
  .value()

const getSizes = ($, collection) => chain(collection)
  .reduce((acc, {tag, attr}) => {
    const domNode = $(tag).get()
    const selectors = getDomNodeSizes(domNode, attr)
    return concat(acc, selectors)
  }, [])
  .sortBy(({size}) => -size)
  .value()

const sizeSelectors = [
  {tag: 'link[rel="apple-touch-icon"]', attr: 'href'},
  {tag: 'link[rel="apple-touch-icon-precomposed"]', attr: 'href'},
  {tag: 'meta[name="msapplication-TileImage"]', attr: 'content'},
  {tag: 'link[rel="icon"]', attr: 'href'},
  {tag: 'link[rel="shortcut icon"]', attr: 'href'}
]

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="og:logo"]').attr('content')),
  wrap($ => $('meta[itemprop="logo"]').attr('content')),
  wrap($ => $('img[src*="logo"]').attr('src')),
  wrap($ => $('img[class*="logo"]').attr('src')),
  wrap($ => {
    const sizes = getSizes($, sizeSelectors)
    const size = chain(sizes).first().get('link').value()
    return size
  }),
  wrap($ => '/favicon.ico')
]
