'use strict'

const test = require('ava')

const { favicon } = require('..')

const { runServer } = require('./helpers')

test('return undefined if favicon is not reachable', async t => {
  const url = 'https://idontexist.lol'
  t.is(await favicon(url), undefined)
})

test("don't resolve favicon.ico with no content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.end('<svg></svg>')
  })
  t.is(await favicon(url), undefined)
})

test("don't resolve favicon.ico with no valid content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/svg+xml; charset=utf-8')
    res.end('<svg></svg>')
  })
  t.is(await favicon(url), undefined)
})

test("favicon.ico with 'image/vnd.microsoft.icon' content-type", async t => {
  const url = 'https://microlink.io/'
  t.is(await favicon(url), 'https://microlink.io/favicon.ico')
})

test("favicon.ico with 'image/x-icon' content-type", async t => {
  const url = 'https://2miners.com/'
  t.is(await favicon(url), 'https://2miners.com/favicon.ico')
})

test('handle redirects', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.writeHead(301, { Location: 'https://microlink.io/favicon.ico' })
    res.end()
  })
  t.is(await favicon(url), 'https://microlink.io/favicon.ico')
})
