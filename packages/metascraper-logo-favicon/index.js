'use strict'

const { URL } = require('url')
const got = require('got')

const {
  isEmpty,
  first,
  toNumber,
  split,
  chain,
  get,
  orderBy
} = require('lodash')

const {
  absoluteUrl,
  logo,
  url: urlFn,
  toRule
} = require('@metascraper/helpers')

const SIZE_REGEX = /\d+x\d+/

const toUrl = toRule(urlFn)

const extensionPriority = str => {
  if (str.endsWith('svg')) return 3
  if (str.endsWith('png')) return 2
  if (str.endsWith('jpg') || str.endsWith('jpeg')) return 1
  return 0
}

const toSize = (input, url) => {
  if (isEmpty(input)) return
  const [verticalSize, horizontalSize] = split(first(split(input, ' ')), 'x')
  const height = toNumber(verticalSize)
  const width = toNumber(horizontalSize)

  return {
    height,
    width,
    square: width === height,
    ext: extensionPriority(url)
  }
}

const getSize = (url, sizes) =>
  toSize(sizes, url) ||
  toSize(first(url.match(SIZE_REGEX)), url) || {
    width: 0,
    height: 0,
    square: true,
    ext: extensionPriority(url)
  }

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
  { tag: 'link[rel*="icon" i]', attr: 'href' }, // apple-icon, // fluid-icon
  { tag: 'meta[name*="msapplication" i]', attr: 'content' } // Windows 8, Internet Explorer 11 Tiles
]

const pickBiggerSize = sizes => {
  const sorted = sizes.reduce(
    (acc, item) => {
      acc[item.size.square ? 'square' : 'nonSquare'].push(item)
      return acc
    },
    { square: [], nonSquare: [] }
  )

  return (
    first(pickBiggerSize.sortBySize(sorted.square)) ||
    first(pickBiggerSize.sortBySize(sorted.nonSquare))
  )
}

pickBiggerSize.sortBySize = collection =>
  orderBy(collection, ['size.width', 'size.ext'], ['desc', 'desc'])

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
  } catch (_) {}
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
