'use strict'

const { isEmpty, first, toNumber, chain, orderBy } = require('lodash')
const reachableUrl = require('reachable-url')
const memoize = require('@keyvhq/memoize')

const {
  logo,
  parseUrl,
  normalizeUrl,
  toRule,
  extension
} = require('@metascraper/helpers')

const ALLOWED_EXTENSION_CONTENT_TYPES = [
  ['ico', ['image/vnd.microsoft.icon', 'image/x-icon']],
  ['png', ['image/png']]
]

const SIZE_REGEX_BY_X = /\d+x\d+/

const toLogo = toRule(logo)

const isValidContenType = (contentType, contentTypes) =>
  contentType && contentTypes.some(ct => contentType.includes(ct))

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
      if (!relativeUrl || relativeUrl === url) return acc
      const normalizedUrl = normalizeUrl(url, relativeUrl)
      if (!normalizedUrl) return acc
      return [
        ...acc,
        {
          ...domNode.attribs,
          url: normalizedUrl,
          size: getSize(normalizedUrl, domNode.attribs.sizes)
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

const firstReachable = async (domNodeSizes, resolveFaviconUrl, gotOpts) => {
  for (const { url } of domNodeSizes) {
    const urlExtension = extension(url)
    const contentTypes = ALLOWED_EXTENSION_CONTENT_TYPES.find(
      ([ext]) => ext === urlExtension
    )

    const response = await resolveFaviconUrl(url, contentTypes, gotOpts)
    if (response !== undefined) return response.url
  }
}

const pickBiggerSize = async (
  sizes,
  { resolveFaviconUrl = defaultResolveFaviconUrl, gotOpts } = {}
) => {
  const sorted = sizes.reduce(
    (acc, item) => {
      acc[item.size.square ? 'square' : 'nonSquare'].push(item)
      return acc
    },
    { square: [], nonSquare: [] }
  )

  return (
    (await firstReachable(
      pickBiggerSize.sortBySize(sorted.square),
      resolveFaviconUrl,
      gotOpts
    )) ||
    (await firstReachable(
      pickBiggerSize.sortBySize(sorted.nonSquare),
      resolveFaviconUrl,
      gotOpts
    ))
  )
}

pickBiggerSize.sortBySize = collection =>
  orderBy(collection, ['size.priority'], ['desc'])

const defaultResolveFaviconUrl = async (faviconUrl, contentTypes, gotOpts) => {
  const response = await reachableUrl(faviconUrl, gotOpts)
  if (!reachableUrl.isReachable(response)) return undefined

  const contentType = response.headers['content-type']

  if (contentTypes && !isValidContenType(contentType, contentTypes)) {
    return undefined
  }

  if (contentTypes && (!response.body || response.body.toString()[0] === '<')) {
    return undefined
  }

  return response
}

const createFavicon = (
  [ext, contentTypes],
  resolveFaviconUrl = defaultResolveFaviconUrl
) => {
  return async (url, { gotOpts } = {}) => {
    const faviconUrl = logo(`/favicon.${ext}`, { url })
    return faviconUrl
      ? resolveFaviconUrl(faviconUrl, contentTypes, gotOpts).then(
        response => response?.url
      )
      : undefined
  }
}

const google = async (url, { gotOpts } = {}) => {
  const response = await reachableUrl(google.url(url), gotOpts)
  return reachableUrl.isReachable(response) ? response.url : undefined
}

google.url = (url, size = 128) =>
  `https://www.google.com/s2/favicons?domain_url=${url}&sz=${size}`

const createGetLogo = ({
  gotOpts,
  keyvOpts,
  resolveFaviconUrl,
  withFavicon,
  withGoogle
}) => {
  const getLogo = async url => {
    const providers = ALLOWED_EXTENSION_CONTENT_TYPES.map(
      ext => withFavicon && createFavicon(ext, resolveFaviconUrl)
    )
      .concat(withGoogle && google)
      .filter(Boolean)

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
  favicon: withFavicon = true,
  google: withGoogle = true,
  gotOpts,
  keyvOpts,
  pickFn = pickBiggerSize,
  resolveFaviconUrl = defaultResolveFaviconUrl,
  rootFavicon: withRootFavicon = true
} = {}) => {
  const getLogo = createGetLogo({
    gotOpts,
    keyvOpts,
    resolveFaviconUrl,
    withFavicon,
    withGoogle
  })
  const rootFavicon = createRootFavicon({ getLogo, withRootFavicon })
  const rules = {
    logo: [
      toLogo(async ($, url) => {
        const sizes = getSizes($, sizeSelectors, url)
        return await pickFn(sizes, {
          resolveFaviconUrl,
          gotOpts,
          pickBiggerSize
        })
      }),
      ({ url }) => getLogo(normalizeUrl(url)),
      rootFavicon
    ].filter(Boolean)
  }

  rules.pkgName = 'metascraper-logo-favicon'

  return rules
}

module.exports.google = google
module.exports.createFavicon = createFavicon
module.exports.createRootFavicon = createRootFavicon
module.exports.createGetLogo = createGetLogo
module.exports.pickBiggerSize = pickBiggerSize
module.exports.resolveFaviconUrl = defaultResolveFaviconUrl
