'use strict'

const {
  url: isUrl,
  $filter,
  title,
  author,
  createWrap,
  lang
} = require('@metascraper/helpers')

const { getPublicSuffix } = require('tldts')
const memoizeOne = require('memoize-one')

const REGEX_AMAZON_URL = /https?:\/\/(.*amazon\..*\/.*|.*amzn\..*\/.*|.*a\.co\/.*)/i

const isValidUrl = memoizeOne(url => REGEX_AMAZON_URL.test(url))

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

const wrapUrl = createWrap(isUrl)
const wrapAuthor = createWrap(author)
const wrapTitle = createWrap(title, { removeSeparator: false })
const wrapLang = createWrap(lang)

module.exports = () => {
  const rules = {
    lang: [wrapLang(($, url) => getDomainLanguage(url))],
    author: [
      wrapAuthor($ => $('.contributorNameID').text()),
      wrapAuthor($ => $('#bylineInfo').text()),
      wrapAuthor($ => $('#brand').text())
    ],
    title: [
      wrapTitle($ => $('#productTitle').text()),
      wrapTitle($ => $('#btAsinTitle').text()),
      wrapTitle($ => $filter($, $('h1.a-size-large'))),
      wrapTitle($ => $('#item_name').text())
    ],
    publisher: [() => 'Amazon'],
    image: [
      wrapUrl($ => $('.a-dynamic-image').attr('data-old-hires')),
      wrapUrl($ => $('.a-dynamic-image').attr('src'))
    ]
  }

  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
