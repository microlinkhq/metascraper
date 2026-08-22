'use strict'

const { parseUrl } = require('@metascraper/helpers')

const { comparable, flatten, isBannerLine, tidy } = require('./text')

const PUBLISHER_NOISE =
  /https?:\/\/\S+|\bwww\.\S+|\bdoi:\S+|\b10\.\d{4,9}\/\S+|\(\s*\d{4}\s*\)|,?\s*\bpages?\b.*$|\b\d[\d:;,.()-]*\b/gi
const PUBLISHER_SEGMENTS = /\s*[|·•‖]\s*/
const LETTER_SPACED = /\b(?:\p{L}\s){3,}\p{L}\b/gu
const RIGHTS_NOTICE = /©|\(c\)|\ball rights reserved\b\.?/gi
const WORKFLOW_PREFIX =
  /^(published|received|accepted|submitted|revised|edited|reviewed|updated|available)\b/i
const STRUCTURAL_WORD =
  /^(january|february|march|april|may|june|july|august|september|october|november|december|winter|spring|summer|fall|autumn|volume|vol|issue|no|number|article|page|pp|supplement|edition|part|series)$/i

const VENUE_OPENING =
  /^(proceedings|journal|transactions|communications|frontiers|revista|revue|zeitschrift|annals|acta|bulletin|nature|scientific reports|plos|ieee|acm|arxiv|biorxiv|the journal)\b/i
const VENUE_MARK = /\b(publish\w+|proceedings|conference|symposium)\b/i
const AFFILIATION =
  /\b(universi\w*|department|departamento|dept|laborator\w*|labs?|faculty|school|college|institut\w*|hospital|clinic|cent(er|re|ro)|research|group|team|division)\b/i

const CITY_STATE = /^\p{Lu}[\p{L}.' -]+,\s*[A-Z]{2}$/u

const HOST_PUBLISHER = {
  arxiv: 'arXiv',
  nber: 'NBER',
  jmlr: 'JMLR',
  thecvf: 'CVF',
  neurips: 'NeurIPS',
  plos: 'PLOS',
  nature: 'Nature',
  elifesciences: 'eLife',
  frontiersin: 'Frontiers',
  aclanthology: 'ACL Anthology',
  redalyc: 'Redalyc',
  'ceur-ws': 'CEUR-WS',
  springer: 'Springer',
  biomedcentral: 'BMC',
  bis: 'BIS',
  bitcoin: 'Bitcoin',
  berkshirehathaway: 'Berkshire Hathaway',
  openai: 'OpenAI'
}

const MAX_PUBLISHER_WORDS = 12

const collapseLetterSpacing = text =>
  text.replace(LETTER_SPACED, match => match.replace(/\s+/g, ''))

const hostName = url => {
  const { domainWithoutSuffix, hostname } = parseUrl(url) || {}
  return domainWithoutSuffix || hostname || null
}

const publisherFromUrl = url => {
  const { domainWithoutSuffix, hostname } = parseUrl(url) || {}
  if (HOST_PUBLISHER[domainWithoutSuffix]) {
    return HOST_PUBLISHER[domainWithoutSuffix]
  }
  const name = domainWithoutSuffix || hostname || url
  return name.length > 1 ? name[0].toUpperCase() + name.slice(1) : name
}

const matchesHost = (value, url) => {
  const host = hostName(url)
  if (!host) return false
  return (
    comparable(value).startsWith(comparable(host)) ||
    comparable(host).startsWith(comparable(value))
  )
}

const isVenue = (value, url) =>
  Boolean(value) &&
  (VENUE_OPENING.test(value) ||
    VENUE_MARK.test(value) ||
    matchesHost(value, url))

/**
 * Running headers and footers carry the venue next to volume, doi and page
 * numbers: `Scientific Reports | (2023) 13:1234 | https://doi.org/...`.
 */
const publisherFromLine = text =>
  flatten(collapseLetterSpacing(text).replace(RIGHTS_NOTICE, ' '))
    .split(PUBLISHER_SEGMENTS)
    .map(part => flatten(tidy(part.replace(PUBLISHER_NOISE, ' '))))
    .filter(part => {
      const words = part.split(/\s+/).filter(Boolean)
      if (words.length === 0 || words.length > MAX_PUBLISHER_WORDS) return false
      if (WORKFLOW_PREFIX.test(part)) return false
      return (
        /\p{L}{3}/u.test(part) &&
        !words.every(word => STRUCTURAL_WORD.test(word))
      )
    })[0] || null

const sameText = (left, right) =>
  Boolean(left && right) && comparable(left) === comparable(right)

const isUsablePublisher = (value, { author, title }) =>
  Boolean(value) &&
  !sameText(value, author) &&
  !sameText(value, title) &&
  !AFFILIATION.test(value) &&
  !CITY_STATE.test(value)

const getPublisher = (lines, { url, title, author }) => {
  const venue = lines
    .filter(line => !isBannerLine(line.text))
    .map(line => publisherFromLine(line.text))
    .find(
      value =>
        isVenue(value, url) && isUsablePublisher(value, { author, title })
    )

  return venue || publisherFromUrl(url)
}

module.exports = { getPublisher, isVenue, publisherFromLine, publisherFromUrl }
