'use strict'

const memoize = require('@keyvhq/memoize')
const reachableUrl = require('reachable-url')

const {
  logo,
  mimeExtension,
  parseUrl,
  protocol,
  toRule
} = require('@metascraper/helpers')

const toLogo = toRule(logo)

const isHttps = url => protocol(url) === 'https'

const parseTag = tag => {
  const [name, ...value] = tag.split('=')
  return [name.trim().toLowerCase(), value.join('=').trim()]
}

/**
 * A BIMI record is a list of `;` separated `tag=value` pairs where `v=BIMI1`
 * comes first and `l` points to the logo. An empty `l` is a declination: the
 * domain explicitly opts out of publishing a logo.
 *
 * https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi
 */
const parseRecord = record => {
  const [[versionTag, version], ...tags] = record.split(';').map(parseTag)
  if (versionTag !== 'v' || version.toLowerCase() !== 'bimi1') return undefined
  const location = tags.find(([name]) => name === 'l')?.[1]
  return isHttps(location) ? location : undefined
}

const getRecord = async (domain, { resolveTxt, selector }) => {
  let answers

  try {
    answers = await resolveTxt(`${selector}._bimi.${domain}`)
  } catch {
    return undefined
  }

  for (const answer of answers) {
    const logoUrl = parseRecord(answer.join(''))
    if (logoUrl) return logoUrl
  }
}

const isSvg = ({ headers }) => mimeExtension(headers['content-type']) === 'svg'

/**
 * The record location is verified to be https when parsed, but redirects are
 * followed, so the URL that ends up being served has to be checked again.
 */
const toLogoUrl = response =>
  reachableUrl.isReachable(response) && isSvg(response) && isHttps(response.url)
    ? response.url
    : undefined

const defaultResolveLogoUrl = async (logoUrl, gotOpts) =>
  toLogoUrl(await reachableUrl(logoUrl, gotOpts))

/**
 * Loaded lazily so runtimes without `node:dns` can still require the package
 * and supply their own resolver.
 */
const systemResolveTxt = hostname =>
  require('dns').promises.resolveTxt(hostname)

const createGetLogo = ({
  gotOpts,
  keyvOpts,
  resolveLogoUrl = defaultResolveLogoUrl,
  resolveTxt = systemResolveTxt,
  selector = 'default'
} = {}) => {
  const getLogo = async domain => {
    const logoUrl = await getRecord(domain, { resolveTxt, selector })
    if (logoUrl) return resolveLogoUrl(logoUrl, gotOpts)
  }

  const fn = memoize(getLogo, keyvOpts, {
    value: value => (value === undefined ? null : value)
  })

  return domain =>
    fn(domain).then(value => (value === null ? undefined : value))
}

module.exports = options => {
  const getLogo = createGetLogo(options)

  const rules = {
    logo: [toLogo((_, url) => getLogo(parseUrl(url).domain))]
  }

  rules.pkgName = 'metascraper-logo-bimi'

  return rules
}

module.exports.createGetLogo = createGetLogo
module.exports.parseRecord = parseRecord
module.exports.resolveLogoUrl = defaultResolveLogoUrl
module.exports.toLogoUrl = toLogoUrl
