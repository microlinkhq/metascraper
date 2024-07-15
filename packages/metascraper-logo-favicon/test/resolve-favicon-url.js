'use strict'

const test = require('ava')

const { resolveFaviconUrl } = require('..')
const { runServer } = require('./helpers')

const toUrl = (basename, pathname) => new URL(pathname, basename).toString()

test('undefined if favicon url is not reachable', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.statusCode = 404
    res.end('Not Found')
  })
  t.is(await resolveFaviconUrl(toUrl(url, 'favico.ico')), undefined)
})

test('undefined if content type is not expected', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/svg+xml')
    res.end()
  })
  t.is(await resolveFaviconUrl(toUrl(url, 'favicon.ico'), []), undefined)
})

test('undefined if body is not the expected according to content type', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/x-icon')
    res.end('<svg></svg>')
  })

  t.is(
    await resolveFaviconUrl(`${url}favicon.png`, ['image/x-icon']),
    undefined
  )
})
