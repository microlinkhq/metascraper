'use strict'

const { lang, parseUrl } = require('@metascraper/helpers')

const HOST_LANG = {
  redalyc: 'es',
  scielo: 'es'
}

const EN =
  '\\b(the|and|of|to|in|for|with|this|that|from|are|was|we|is|on|as|by|an|a|be|or|it)\\b'
const ES =
  '\\b(el|la|los|las|del|una|para|con|por|que|este|esta|como|más|un|se|al)\\b'

const hostLang = url => {
  const { domainWithoutSuffix } = parseUrl(url) || {}
  return HOST_LANG[domainWithoutSuffix] || null
}

const count = (text, pattern) =>
  (text.match(new RegExp(pattern, 'gi')) || []).length

const fromText = text => {
  const sample = String(text || '').slice(0, 2000)
  const en = count(sample, EN)
  const es = count(sample, ES)
  if (es > en && es >= 8) return 'es'
  if (en >= 4) return 'en'
  return null
}

const getLang = (text, { url, embedded } = {}) =>
  lang(embedded?.lang) || hostLang(url) || fromText(text)

module.exports = { getLang }
