'use strict'

const {
  $filter,
  author,
  toRule,
  lang,
  memoizeOne,
  title,
  url
} = require('@metascraper/helpers')

const { getPublicSuffix } = require('tldts')

const REGEX_AMAZON_URL = /https?:\/\/(.*amazon\..*\/.*|.*amzn\..*\/.*|.*a\.co\/.*)/i

const isValidUrl = memoizeOne(({ url }) => REGEX_AMAZON_URL.test(url))

const SUFFIX_LANGUAGES = {
  ca: 'en',
  cn: 'zh',
  'co.jp': 'ja',
  'co.uk': 'en',
  'com.mx': 'es',
  com: 'en',
  de: 'de',
  es: 'es',
  fr: 'fr',
  in: 'en',
  it: 'it'
}

const getDomainLanguage = url => SUFFIX_LANGUAGES[getPublicSuffix(url)]

const toUrl = toRule(url)
const toAuthor = toRule(author)
const toTitle = toRule(title, { removeSeparator: false })
const toLang = toRule(lang)

module.exports = () => {
  const rules = {
    lang: [toLang(($, url) => getDomainLanguage(url))],
    author: [
      toAuthor($ => $('.contributorNameID').text()),
      toAuthor($ => $('#bylineInfo').text()),
      toAuthor($ => $('#brand').text())
    ],
    title: [
      toTitle($ => $('#productTitle').text()),
      toTitle($ => $('#btAsinTitle').text()),
      toTitle($ => $filter($, $('h1.a-size-large'))),
      toTitle($ => $('#item_name').text())
    ],
    publisher: [() => 'Amazon'],
    image: [
      toUrl($ => $('.a-dynamic-image').attr('data-old-hires')),
      toUrl($ => $('.a-dynamic-image').attr('src'))
    ]
  }

  rules.test = isValidUrl
  return rules
}
