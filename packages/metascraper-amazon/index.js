'use strict'

const {
  $filter,
  author,
  lang,
  memoizeOne,
  parseUrl,
  title,
  toRule,
  url
} = require('@metascraper/helpers')

const REGEX_AMAZON_URL = /https?:\/\/(.*amazon\..*\/.*|.*amzn\..*\/.*|.*a\.co\/.*)/i

const test = memoizeOne(url => REGEX_AMAZON_URL.test(url))

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

const getDomainLanguage = url => SUFFIX_LANGUAGES[parseUrl(url).publicSuffix]

const toUrl = toRule(url)
const toAuthor = toRule(author)
const toTitle = toRule(title, { removeSeparator: false })
const toLang = toRule(lang)

module.exports = () => {
  const rules = {
    lang: [toLang(($, url) => getDomainLanguage(url))],
    author: [
      toAuthor($ => $filter($, $('.contributorNameID'))),
      toAuthor($ => $filter($, $('#bylineInfo'))),
      toAuthor($ => $filter($, $('#brand')))
    ],
    title: [
      toTitle($ => $filter($, $('#productTitle'))),
      toTitle($ => $filter($, $('#btAsinTitle'))),
      toTitle($ => $filter($, $('h1.a-size-large'))),
      toTitle($ => $filter($, $('#item_name')))
    ],
    publisher: () => 'Amazon',
    image: [
      toUrl($ => $('.a-dynamic-image').attr('data-old-hires')),
      toUrl($ => $('.a-dynamic-image').attr('src'))
    ]
  }

  rules.test = ({ url }) => test(url)

  return rules
}
