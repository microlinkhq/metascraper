'use strict'

const memoize = require('@keyvhq/memoize')
const reachableUrl = require('reachable-url')
const dns = require('dns')

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
  const [name, ...rest] = tag.split('=')
  return [name.trim().toLowerCase(), rest.join('=').trim()]
}

const parseTags = record => record.split(';').map(parseTag)

const isBimi = ([[name, value]]) =>
  name === 'v' && value.toLowerCase() === 'bimi1'

/**
 * `l` is https only, and an empty one is a declination: the domain opting out
 * of publishing a logo. Both leave nothing to resolve.
 *
 * https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2
 */
const toLocation = tags => {
  const location = tags.find(([name]) => name === 'l')?.[1]
  return isHttps(location) ? location : undefined
}

const toHostname = (domain, selector) => `${selector}._bimi.${domain}`

/**
 * Other TXT records can share the hostname, so they are discarded rather than
 * read as an absent record. What remains has to be a single record, so a second
 * one cannot override the first, including its declination.
 *
 * https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-7.2
 */
const getRecord = async (hostname, resolveTxt) => {
  const answers = await resolveTxt(hostname).catch(() => [])
  const records = answers
    .map(answer => parseTags(answer.join('')))
    .filter(isBimi)
  return records.length === 1 ? toLocation(records[0]) : undefined
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

const createGetLogo = ({
  gotOpts,
  keyvOpts,
  resolveLogoUrl = defaultResolveLogoUrl,
  resolveTxt = dns.promises.resolveTxt,
  selector = 'default'
} = {}) => {
  const getLogo = async hostname => {
    const logoUrl = await getRecord(hostname, resolveTxt)
    if (logoUrl) return resolveLogoUrl(logoUrl, gotOpts)
  }

  const fn = memoize(getLogo, keyvOpts, {
    value: value => (value === undefined ? null : value)
  })

  return domain =>
    fn(toHostname(domain, selector)).then(value =>
      value === null ? undefined : value
    )
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
module.exports.resolveLogoUrl = defaultResolveLogoUrl
module.exports.toLogoUrl = toLogoUrl
