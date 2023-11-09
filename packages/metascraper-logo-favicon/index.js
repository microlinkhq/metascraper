'use strict'

const { isEmpty, first, toNumber, chain, get, orderBy } = require('lodash')
const reachableUrl = require('reachable-url')
const memoize = require('@keyvhq/memoize')

const {
  logo,
  parseUrl,
  normalizeUrl,
  toRule,
  url: urlFn
} = require('@metascraper/helpers')

const SIZE_REGEX_BY_X = /\d+x\d+/

const toUrl = toRule(urlFn)

const toSize = (input, url) => {
  if (isEmpty(input)) return

  const [verticalSize, horizontalSize] = chain(input)
    .replace(/×/g, 'x')
    .split('x')
    .value()

  const height = toNumber(verticalSize) || 0
  const width = toNumber(horizontalSize) || 0

  return {
    height,
    width,
    square: width === height,
    priority: toSize.priority({ url, width: width || 1 })
  }
}

toSize.fallback = url => ({
  width: 0,
  height: 0,
  square: true,
  priority: toSize.priority({ url, width: 1 })
})

toSize.priority = ({ url, width }) => {
  // lets consider apple icon is beauty
  if (url.includes('apple')) return 5 * width
  if (url.includes('android')) return 5 * width
  if (url.endsWith('png')) return 5 * width
  if (url.endsWith('jpg') || url.endsWith('jpeg')) return 4 * width
  if (url.endsWith('svg')) return 3 * width
  if (url.endsWith('ico')) return 2 * width
  return 1 * width
}

const getSize = (url, sizes) =>
  toSize(sizes, url) ||
  toSize(first(url.match(SIZE_REGEX_BY_X)), url) ||
  toSize.fallback(url)

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
  orderBy(collection, ['size.priority'], ['desc'])

const favicon = async (url, { gotOpts } = {}) => {
  const faviconUrl = logo('/favicon.ico', { url })
  if (!faviconUrl) return undefined
  const response = await reachableUrl(faviconUrl, gotOpts)
  return reachableUrl.isReachable(response) &&
    response.headers['content-type']?.startsWith('image')
    ? faviconUrl
    : undefined
}

const google = async (url, { gotOpts } = {}) => {
  const response = await reachableUrl(google.url(url), gotOpts)
  return reachableUrl.isReachable(response) ? response.url : undefined
}

google.url = (url, size = 128) =>
  `https://www.google.com/s2/favicons?domain_url=${url}&sz=${size}`

const createGetLogo = ({ withGoogle, withFavicon, gotOpts, keyvOpts }) => {
  const getLogo = async url => {
    const providers = [withFavicon && favicon, withGoogle && google].filter(
      Boolean
    )

    for (const provider of providers) {
      const logoUrl = await provider(url, { gotOpts })
      if (logoUrl) return logoUrl
    }
  }

  const fn = memoize(getLogo, keyvOpts, {
    value: value => (value === undefined ? null : value)
  })

  return (...args) =>
    fn(...args).then(value => (value === null ? undefined : value))
}

const createRootFavicon = ({ getLogo, withRootFavicon = true } = {}) => {
  if (withRootFavicon === false) return undefined
  return ({ url }) => {
    const urlObj = new URL(url)
    const domain = parseUrl(url).domain

    if (withRootFavicon instanceof RegExp && withRootFavicon.test(domain)) {
      return undefined
    }

    urlObj.hostname = domain
    return getLogo(normalizeUrl(urlObj))
  }
}

module.exports = ({
  google: withGoogle = true,
  favicon: withFavicon = true,
  rootFavicon: withRootFavicon = true,
  gotOpts,
  keyvOpts,
  pickFn = pickBiggerSize
} = {}) => {
  const getLogo = createGetLogo({ withGoogle, withFavicon, gotOpts, keyvOpts })
  const rootFavicon = createRootFavicon({ getLogo, withRootFavicon })
  return {
    logo: [
      toUrl($ => {
        const sizes = getSizes($, sizeSelectors)
        const size = pickFn(sizes, pickBiggerSize)
        return get(size, 'url')
      }),
      ({ url }) => getLogo(normalizeUrl(url)),
      rootFavicon
    ].filter(Boolean)
  }
}

module.exports.favicon = favicon
module.exports.google = google
module.exports.createRootFavicon = createRootFavicon
module.exports.createGetLogo = createGetLogo
