'use strict'

const {
  url: urlFn,
  $filter,
  title,
  author,
  createWard,
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

const wrapUrl = createWrap(urlFn)
const wrapAuthor = createWrap(author)
const wrapTitle = createWrap(title, { removeSeparator: false })
const wrapLang = createWrap(lang)
const ward = createWard(({ url }) => isValidUrl(url))

module.exports = () => ({
  lang: [ward(wrapLang(($, url) => getDomainLanguage(url)))],
  author: [
    ward(wrapAuthor($ => $('.contributorNameID').text())),
    ward(wrapAuthor($ => $('#bylineInfo').text())),
    ward(wrapAuthor($ => $('#brand').text()))
  ],
  title: [
    ward(wrapTitle($ => $('#productTitle').text())),
    ward(wrapTitle($ => $('#btAsinTitle').text())),
    ward(wrapTitle($ => $filter($, $('h1.a-size-large')))),
    ward(wrapTitle($ => $('#item_name').text()))
  ],
  publisher: [ward(() => 'Amazon')],
  image: [
    ward(wrapUrl($ => $('.a-dynamic-image').attr('data-old-hires'))),
    ward(wrapUrl($ => $('.a-dynamic-image').attr('src')))
  ]
})
