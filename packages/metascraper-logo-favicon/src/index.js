'use strict'

const { logo, parseUrl, normalizeUrl, toRule } = require('@metascraper/helpers')
const { isEmpty, first, toNumber, chain, orderBy } = require('lodash')
const reachableUrl = require('reachable-url')
const memoize = require('@keyvhq/memoize')

const SIZE_REGEX_BY_X = /\d+x\d+/

const toLogo = toRule(logo)

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

const getDomNodeSizes = (domNodes, attr, url) =>
  chain(domNodes)
    .reduce((acc, domNode) => {
      const relativeUrl = domNode.attribs[attr]
      if (!relativeUrl) return acc
      return [
        ...acc,
        {
          ...domNode.attribs,
          url: normalizeUrl(url, relativeUrl),
          size: getSize(url, domNode.attribs.sizes)
        }
      ]
    }, [])
    .value()

const getSizes = ($, collection, url) =>
  chain(collection)
    .reduce((acc, { tag, attr }) => {
      const domNodes = $(tag).get()
      return [...acc, ...getDomNodeSizes(domNodes, attr, url)]
    }, [])
    .value()

const sizeSelectors = [
  { tag: 'link[rel*="icon" i]', attr: 'href' }, // apple-icon, // fluid-icon
  { tag: 'meta[name*="msapplication" i]', attr: 'content' } // Windows 8, Internet Explorer 11 Tiles
]

const firstReachable = async (domNodeSizes, gotOpts) => {
  for (const { url } of domNodeSizes) {
    const response = await reachableUrl(url, gotOpts)
    if (reachableUrl.isReachable(response)) {
      return response.url
    }
  }
}

const pickBiggerSize = async (sizes, { gotOpts } = {}) => {
  const sorted = sizes.reduce(
    (acc, item) => {
      acc[item.size.square ? 'square' : 'nonSquare'].push(item)
      return acc
    },
    { square: [], nonSquare: [] }
  )

  return (
    (await firstReachable(pickBiggerSize.sortBySize(sorted.square), gotOpts)) ||
    (await firstReachable(pickBiggerSize.sortBySize(sorted.nonSquare), gotOpts))
  )
}

pickBiggerSize.sortBySize = collection =>
  orderBy(collection, ['size.priority'], ['desc'])

const createFavicon =
  ({ ext, contentTypes }) =>
    async (url, { gotOpts } = {}) => {
      const faviconUrl = logo(`/favicon.${ext}`, { url })
      if (!faviconUrl) return undefined

      const response = await reachableUrl(faviconUrl, gotOpts)
      const contentType = response.headers['content-type']

      const isValidContenType =
      contentType && contentTypes.some(ct => contentType.includes(ct))

      return isValidContenType && reachableUrl.isReachable(response)
        ? response.url
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
    const providers = [
      withFavicon &&
        createFavicon({
          ext: 'png',
          contentTypes: ['image/png']
        }),
      withFavicon &&
        createFavicon({
          ext: 'ico',
          contentTypes: ['image/vnd.microsoft.icon', 'image/x-icon']
        }),
      withGoogle && google
    ].filter(Boolean)

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
      toLogo(async ($, url) => {
        const sizes = getSizes($, sizeSelectors, url)
        return await pickFn(sizes, { gotOpts, pickBiggerSize })
      }),
      ({ url }) => getLogo(normalizeUrl(url)),
      rootFavicon
    ].filter(Boolean)
  }
}

module.exports.google = google
module.exports.createFavicon = createFavicon
module.exports.createRootFavicon = createRootFavicon
module.exports.createGetLogo = createGetLogo
module.exports.pickBiggerSize = pickBiggerSize
