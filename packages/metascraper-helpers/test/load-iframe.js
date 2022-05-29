'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { loadIframe } = require('..')

test('timeout support', async t => {
  const url =
    'https://accounts.google.com/gsi/iframe/select?client_id=1005640118348-amh5tgkq641oru4fbhr3psm3gt2tcc94.apps.googleusercontent.com&ux_mode=popup&ui_mode=card&as=GAUOzT7W7w8RiyH1fhs9TQ&channel_id=c8d85ad52a58747f6547a90cd4bb19047262e93029f574d126cf2095a7a80f9b&origin=https%3A%2F%2Fwww.nytimes.com'
  const $ = cheerio.load(`<iframe src="${url}"></iframe>`)

  const $iframe = await loadIframe(url, $)
  t.is($iframe.html(), '<html><head></head><body></body></html>')
})

test('wait `load` event', async t => {
  const url =
    'https://wbez-rss.streamguys1.com/player/player21011316001810372.html'
  const $ = cheerio.load(`<iframe src="${url}"></iframe>`)

  const $iframe = await loadIframe(url, $)
  t.true($iframe.html().includes('twitter:player'))
})
