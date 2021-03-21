'use strict'

const { isEmpty, first, toNumber, split, chain, get } = require('lodash')
const { URL } = require('url')
const got = require('got')

const {
  absoluteUrl,
  logo,
  url: urlFn,
  toRule
} = require('@metascraper/helpers')

const SIZE_REGEX = /\d+x\d+/

const toUrl = toRule(urlFn)

const toSize = str => {
  const [size] = split(str, 'x')
  return !isEmpty(size) ? toNumber(size) : 0
}

const getSize = (url, sizes) =>
  toSize(sizes) || toSize(first(url.match(SIZE_REGEX)))

const getDomNodeSizes = (domNodes, attr) =>
  chain(domNodes)
    .reduce((acc, domNode) => {
      const url = domNode.attribs[attr]
      if (!url) return acc
      return [
        ...acc,
        {
          ...domNode.attribs,
          url,
          size: getSize(url, domNode.attribs.sizes)
        }
      ]
    }, [])
    .value()

const getSizes = ($, collection) =>
  chain(collection)
    .reduce((acc, { tag, attr }) => {
      const domNodes = $(tag).get()
      return [...acc, ...getDomNodeSizes(domNodes, attr)]
    }, [])
    .value()

const sizeSelectors = [
  { tag: 'link[rel*="apple-touch-icon"]', attr: 'href' },
  { tag: 'meta[name*="msapplication-tileimage" i]', attr: 'content' },
  { tag: 'link[rel="icon"]', attr: 'href' },
  { tag: 'link[rel="shortcut icon"]', attr: 'href' }
]

const pickBiggerSize = sizes =>
  chain(sizes)
    .orderBy('size', 'desc')
    .first()
    .value()

const DEFAULT_GOT_OPTS = {
  timeout: 3000
}

const createGetLogo = gotOpts => async url => {
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

/**
 * Rules.
 */
module.exports = ({ gotOpts, pickFn = pickBiggerSize } = {}) => {
  const getLogo = createGetLogo(gotOpts)

  return {
    logo: [
      toUrl($ => {
        const sizes = getSizes($, sizeSelectors)
        const size = pickFn(sizes, pickBiggerSize)
        return get(size, 'url')
      }),
      ({ url }) => getLogo(url)
    ]
  }
}
