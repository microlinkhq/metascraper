'use strict'

const { promises: dns } = require('dns')
const memoize = require('@keyvhq/memoize')
const reachableUrl = require('reachable-url')

const { logo, parseUrl, toRule } = require('@metascraper/helpers')

const SVG_CONTENT_TYPE = 'image/svg+xml'

const VERSION_TAG = /^\s*v\s*=\s*BIMI1\s*$/i

const toLogo = toRule(logo)

/**
 * A BIMI record is a list of `;` separated `tag=value` pairs where `v=BIMI1`
 * comes first and `l` points to the logo. An empty `l` is a declination: the
 * domain explicitly opts out of publishing a logo.
 *
 * https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi
 */
const parseRecord = record => {
  const [version, ...tags] = String(record).split(';')
  if (!VERSION_TAG.test(version)) return undefined

  for (const tag of tags) {
    const separatorIndex = tag.indexOf('=')
    if (separatorIndex === -1) continue
    if (tag.slice(0, separatorIndex).trim().toLowerCase() !== 'l') continue
    const location = tag.slice(separatorIndex + 1).trim()
    return location.startsWith('https://') ? location : undefined
  }
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

const isSvg = ({ headers }) =>
  headers['content-type']?.split(';')[0].trim().toLowerCase() ===
  SVG_CONTENT_TYPE

const defaultResolveLogoUrl = async (logoUrl, gotOpts) => {
  const response = await reachableUrl(logoUrl, gotOpts)
  return reachableUrl.isReachable(response) && isSvg(response)
    ? response.url
    : undefined
}

const createGetLogo = ({
  gotOpts,
  keyvOpts,
  resolveLogoUrl = defaultResolveLogoUrl,
  resolveTxt = dns.resolveTxt,
  selector = 'default'
} = {}) => {
  const getLogo = async domain => {
    const logoUrl = await getRecord(domain, { resolveTxt, selector })
    return logoUrl === undefined ? undefined : resolveLogoUrl(logoUrl, gotOpts)
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
