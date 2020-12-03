'use strict'

const asyncMemoizeOne = require('async-memoize-one')
const { getDomainWithoutSuffix } = require('tldts')
const { JSDOM, VirtualConsole } = require('jsdom')
const parseCssUrls = require('css-url-parser')

const {
  memoizeOne,
  date,
  author,
  image,
  toRule
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toImage = toRule(image)
const toDate = toRule(date)

const TELEGRAM_DOMAINS = ['telegram', 't']

const isValidUrl = memoizeOne(url =>
  TELEGRAM_DOMAINS.includes(getDomainWithoutSuffix(url))
)

const loadIframe = asyncMemoizeOne(
  (url, html) =>
    new Promise(resolve => {
      const dom = new JSDOM(html, {
        url,
        virtualConsole: new VirtualConsole(),
        runScripts: 'dangerously',
        resources: 'usable'
      })

      const resolveIframe = iframe =>
        iframe.addEventListener('load', () => resolve(iframe.contentWindow))

      const getIframe = () => dom.window.document.querySelector('iframe')

      const iframe = getIframe()
      if (iframe) return resolveIframe(iframe)

      dom.window.document.addEventListener('DOMContentLoaded', () =>
        resolveIframe(getIframe())
      )
    })
)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $('meta[property="og:title"]').attr('content'))],
    logo: [toImage($ => $('meta[property="og:image"]').attr('content'))],
    image: [
      toImage(async ($, url) => {
        const dom = await loadIframe(url, $.html())
        const el =
          dom.window.document.querySelector('.link_preview_image') ||
          dom.window.document.querySelector('.link_preview_right_image') ||
          dom.window.document.querySelector('.tgme_widget_message_photo_wrap')
        return el ? parseCssUrls(el.style['background-image'])[0] : undefined
      })
    ],
    date: [
      toDate(async ($, url) => {
        const dom = await loadIframe(url, $.html())
        const el = dom.window.document.querySelector('.datetime')
        return el ? el.getAttribute('datetime') : undefined
      })
    ]
  }
  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
