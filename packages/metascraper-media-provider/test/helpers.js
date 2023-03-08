'use strict'

const { parseUrl } = require('@metascraper/helpers')
const parseProxyUri = require('parse-proxy-uri')

const { PROXY_PASSWORD, PROXY_USERNAME, PROXY_HOST } = process.env

const proxy =
  PROXY_PASSWORD && PROXY_USERNAME && PROXY_HOST
    ? parseProxyUri(
        `socks5://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}`
    )
    : undefined

const PROXY_DOMAINS = ['vimeo', 'facebook']
const PROXY_URLS = ['https://api.twitter.com/1.1/guest/activate.json']

const getProxy = ({ url, retryCount }) => {
  if (retryCount !== 1) return false
  if (PROXY_URLS.includes(url)) return proxy
  if (PROXY_DOMAINS.includes(parseUrl(url).domainWithoutSuffix)) return proxy
  return false
}

const metascraper = require('metascraper')([
  require('..')({ getProxy, timeout: 15000 }),
  require('metascraper-publisher')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

module.exports = { metascraper }
