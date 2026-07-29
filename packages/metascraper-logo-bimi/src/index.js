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

const parseTags = record => record.split(';').map(parseTag)

const isVersionTag = ([name, value]) =>
  name === 'v' && value.toLowerCase() === 'bimi1'

const isRecord = record => isVersionTag(parseTag(record.split(';', 1)[0]))

/**
 * A BIMI record is a list of `;` separated `tag=value` pairs where `v=BIMI1`
 * comes first and `l` points to the logo. An empty `l` is a declination: the
 * domain explicitly opts out of publishing a logo.
 */
const parseRecord = record => {
  const [versionTag, ...tags] = parseTags(record)
  if (!isVersionTag(versionTag)) return undefined
  const location = tags.find(([name]) => name === 'l')?.[1]
  return isHttps(location) ? location : undefined
}

const resolveAnswers = async (hostname, resolveTxt) => {
  try {
    return await resolveTxt(hostname)
  } catch {
    return []
  }
}

/**
 * Other TXT records can share the hostname, so they are discarded rather than
 * read as an absent record. What remains has to be a single record, so a second
 * one cannot override the first, including its declination.
 *
 * https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-7.2
 */
const getRecord = async (domain, { resolveTxt, selector }) => {
  const answers = await resolveAnswers(
    `${selector}._bimi.${domain}`,
    resolveTxt
  )
  const records = answers.map(answer => answer.join('')).filter(isRecord)
  return records.length === 1 ? parseRecord(records[0]) : undefined
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
