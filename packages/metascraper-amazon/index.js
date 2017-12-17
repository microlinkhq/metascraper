'use strict'

const { titleize } = require('@metascraper/helpers')

const REGEX_AMAZON_URL = /https?:\/\/(.*amazon\..*\/.*|.*amzn\.com\/.*)/i
const isAmazonUrl = url => REGEX_AMAZON_URL.test(url)

const wrap = rule => ({ htmlDom, url }) => {
  if (!isAmazonUrl(url)) return
  const value = rule(htmlDom)
  return value
}

module.exports = () => ({
  author: [wrap($ => $('#bylineInfo').text())],
  title: [wrap($ => titleize($('#productTitle').text()))],
  publisher: [wrap($ => 'Amazon')],
  image: [wrap($ => $('#landingImage').attr('src'))]
})
