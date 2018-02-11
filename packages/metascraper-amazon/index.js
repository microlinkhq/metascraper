'use strict'

const { getUrl, getValue, titleize, isUrl } = require('@metascraper/helpers')
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

const getDomainLanguage = url => {
  const {host} = new URL(url)
  const suffix = host.replace('www.', '').split('.')
  suffix.shift()
  return SUFFIX_LANGUAGES[suffix.join('.')]
}

const createWrap = fn => rule => ({ htmlDom, url }) => {
  const value = isAmazonUrl(url) && rule(htmlDom)
  return fn(url, value)
}

const wrap = createWrap((url, value) => value)
const wrapUrl = createWrap((url, value) => isUrl(value) && getUrl(url, value))

module.exports = () => ({
  lang: [({ htmlDom: $, meta, url }) => isAmazonUrl(url) && getDomainLanguage(url)],
  author: [
    wrap($ => titleize($('.contributorNameID').text())),
    wrap($ => titleize($('#bylineInfo').text())),
    wrap($ => titleize($('#brand').text()))
  ],
  title: [
    wrap($ => titleize($('#productTitle').text())),
    wrap($ => titleize($('#btAsinTitle').text())),
    wrap($ => titleize(getValue($, $('h1.a-size-large')))),
    wrap($ => titleize($('#item_name').text()))
  ],
  publisher: [wrap($ => 'Amazon')],
  image: [
    wrapUrl($ => $('.a-dynamic-image').attr('data-old-hires')),
    wrapUrl($ => $('.a-dynamic-image').attr('src'))
  ]
})
