'use strict'

const test = require('ava')

const { createFavicon } = require('..')

const { runServer } = require('./helpers')

const faviconPNG = createFavicon(['png', ['image/png']])
const faviconICO = createFavicon([
  'ico',
  ['image/vnd.microsoft.icon', 'image/x-icon']
])

test('return undefined if favicon is not reachable', async t => {
  const url = 'https://idontexist.lol'
  t.is(await faviconICO(url), undefined)
})

test("don't resolve favicon.ico with no content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.end('<svg></svg>')
  })
  t.is(await faviconICO(url), undefined)
})

test("don't resolve favicon.png with no content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.end('<svg></svg>')
  })
  t.is(await faviconPNG(url), undefined)
})

test("don't resolve favicon.ico with no valid content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/svg+xml; charset=utf-8')
    res.end('<svg></svg>')
  })
  t.is(await faviconICO(url), undefined)
})

test("favicon.png with 'image/png' content-type", async t => {
  const url = 'https://adroll.com/'
  t.is(await faviconPNG(url), 'https://www.adroll.com/favicon.png')
})

test("favicon.ico with 'image/vnd.microsoft.icon' content-type", async t => {
  const url = 'https://microlink.io/'
  t.is(await faviconICO(url), 'https://microlink.io/favicon.ico')
})

test("favicon.ico with 'image/x-icon' content-type", async t => {
  const url = 'https://2miners.com/'
  t.is(await faviconICO(url), 'https://2miners.com/favicon.ico')
})

test('handle redirects', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.writeHead(301, { Location: 'https://microlink.io/favicon.ico' })
    res.end()
  })
  t.is(await faviconICO(url), 'https://microlink.io/favicon.ico')
})
