'use strict'

const { titleize, isUrl } = require('@metascraper/helpers')
const { URL } = require('url')

const REGEX_AMAZON_URL = /https?:\/\/(.*amazon\..*\/.*|.*amzn\..*\/.*|.*a\.co\/.*)/i
const isAmazonUrl = url => REGEX_AMAZON_URL.test(url)

const SUFFIX_LANGUAGES = {
  'ca': 'en',
  'cn': 'zh',
  'co.jp': 'ja',
  'co.uk': 'en',
  'com.mx': 'es',
  'com': 'en',
  'de': 'de',
  'es': 'es',
  'fr': 'fr',
  'in': 'en',
  'it': 'it'
}

const wrap = rule => ({ htmlDom, url }) => isAmazonUrl(url) && rule(htmlDom)

const wrapUrl = rule => ({ htmlDom, url }) => {
  const value = wrap(rule)({htmlDom, url})
  return isUrl(value) && value
}

const getDomainLanguage = url => {
  const {host} = new URL(url)
  const suffix = host.replace('www.', '').split('.')
  suffix.shift()
  return SUFFIX_LANGUAGES[suffix.join('.')]
}

module.exports = () => ({
  lang: [({ htmlDom: $, meta, url }) => getDomainLanguage(url)],
  author: [
    wrap($ => titleize($('.contributorNameID').text())),
    wrap($ => titleize($('#bylineInfo').text())),
    wrap($ => titleize($('#brand').text()))
  ],
  title: [
    wrap($ => titleize($('#productTitle').text())),
    wrap($ => titleize($('#btAsinTitle').text())),
    wrap($ => titleize($('h1.a-size-large').first().text())),
    wrap($ => titleize($('#item_name').text()))
  ],
  publisher: [wrap($ => 'Amazon')],
  image: [
    wrapUrl($ => $('.a-dynamic-image').attr('data-old-hires')),
    wrapUrl($ => $('.a-dynamic-image').attr('src'))
  ]
})
