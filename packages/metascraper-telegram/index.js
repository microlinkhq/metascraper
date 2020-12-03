'use strict'

const { author, image, toRule, memoizeOne } = require('@metascraper/helpers')
const { getDomainWithoutSuffix } = require('tldts')
const { JSDOM, VirtualConsole } = require('jsdom')
const parseCssUrls = require('css-url-parser')

const TELEGRAM_DOMAINS = ['telegram', 't']

const isValidUrl = memoizeOne(url =>
  TELEGRAM_DOMAINS.includes(getDomainWithoutSuffix(url))
)

const toAuthor = toRule(author)
const toImage = toRule(image)

const loadIframe = (url, html) =>
  new Promise(resolve => {
    const dom = new JSDOM(html, {
      url,
      virtualConsole: new VirtualConsole(),
      runScripts: 'dangerously',
      resources: 'usable'
    })

    dom.window.document.addEventListener('DOMContentLoaded', () => {
      const iframe = dom.window.document.querySelector('iframe')
      iframe.addEventListener('load', () => {
        resolve(iframe.contentWindow)
      })
    })
  })

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
    ]
  }
  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
