'use strict'

const {
  isMime,
  audio,
  toRule,
  $filter,
  $jsonld,
  has
} = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { JSDOM, VirtualConsole } = require('jsdom')
const cheerio = require('cheerio')

const toAudio = toRule(audio)

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

// copied from metascraper-telegram TODO: move to helper
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

const audioRules = [
  toAudio($ => $('meta[property="og:audio:secure_url"]').attr('content')),
  toAudio($ => $('meta[property="og:audio"]').attr('content')),
  toAudio($ => {
    const contentType = $(
      'meta[property="twitter:player:stream:content_type"]'
    ).attr('content')
    const streamUrl = $('meta[property="twitter:player:stream"]').attr(
      'content'
    )
    return contentType ? withContentType(streamUrl, contentType) : streamUrl
  }),
  toAudio($jsonld('contentUrl')),
  toAudio($ => $('audio').attr('src')),
  toAudio($ => $('audio > source').attr('src')),
  ({ htmlDom: $ }) => $filter($, $('a'), el => audio(el.attr('href')))
]

module.exports = () => ({
  audio: [
    ...audioRules,
    async ({ htmlDom: $, url }) => {
      if ($('iframe').length === 0) return
      const dom = await loadIframe(url, $.html())
      const $2 = cheerio.load(dom.document.body.innerHTML)
      let index = 0
      let value

      do {
        const rule = audioRules[index++]
        value = await rule({ htmlDom: $2, url })
      } while (!has(value) && index < audioRules.length)

      return value
    }
  ]
})
