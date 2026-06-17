'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

const getIframe = async (url, $) => {
  const src = $('iframe').attr('src') || ''

  if (src.includes('/teslahunt/2351?embed=1')) {
    return `
      <div class="link_preview_right_image" style="background-image:url('https://cdn4.cdn-telegram.org/file/mock-2351.jpg')"></div>
      <time class="datetime" datetime="2020-12-01T08:19:24+00:00"></time>
    `
  }

  if (src.includes('/chollometro/28542?embed=1')) {
    return `
      <div class="link_preview_image" style="background-image:url('https://cdn4.cdn-telegram.org/file/mock-28542.jpg')"></div>
      <time class="datetime" datetime="2021-10-02T20:46:20+00:00"></time>
    `
  }

  if (src.includes('/teslahunt/15513?embed=1')) {
    return `
      <div class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn4.cdn-telegram.org/file/mock-15513.jpg')"></div>
      <time class="datetime" datetime="2021-10-01T22:25:21+00:00"></time>
    `
  }

  return ''
}

const createMetascraper = (opts = {}) =>
  require('metascraper')([
    require('metascraper-telegram')({ getIframe, ...opts }),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-lang')(),
    require('metascraper-logo')(),
    require('metascraper-logo-favicon')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

const createTelegramMetascraper = (...args) =>
  require('metascraper')([require('metascraper-telegram')(...args)])

test('avoid non allowed URLs', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/channel.html'))
  const url = 'https://t.co/d0rwf2dLIp'
  const metascraper = createTelegramMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, undefined)
})

test('avoid URLs with no iframe src', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/channel.html'))
  const url = 'https://t.me/unlimitedhangout'
  const metascraper = createTelegramMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, undefined)
})

test('avoid URLs with no iframe src as http', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/no-iframe.html'))
  const url = 'https://t.me/DiaboxApp'
  const errors = []

  const gotOpts = {
    hooks: {
      beforeError: [
        error => {
          errors.push(error)
          return error
        }
      ]
    }
  }

  const metascraper = createTelegramMetascraper({ gotOpts })
  const metadata = await metascraper({ html, url })
  t.is(errors.length, 0)
  t.is(metadata.audio, undefined)
})

test('post with little image', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-right-preview.html')
  )
  const url = 'https://t.me/teslahunt/2351'
  const metascraper = createMetascraper()
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})

test('post with big image', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-full-image.html')
  )
  const url = 'https://t.me/chollometro/28542'
  const metascraper = createMetascraper()
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})

test('post with an image inside a link', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-link-image.html')
  )
  const url = 'https://t.me/teslahunt/15513'
  const metascraper = createMetascraper()
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})

test('dont take query parameters into account for caching', async t => {
  const cache = new Map()
  const metascraper = createMetascraper({ keyvOpts: { store: cache } })
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-link-image.html')
  )
  t.is(cache.size, 0)
  await metascraper({ html, url: 'https://t.me/teslahunt/15513' })
  t.is(cache.size, 1)
  await metascraper({ html, url: 'https://t.me/teslahunt/15513?start=1' })
  t.is(cache.size, 1)
})
