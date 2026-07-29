'use strict'

const { default: listen } = require('async-listen')
const reachableUrl = require('reachable-url')
const { createServer } = require('http')
const { promisify } = require('util')
const test = require('ava').default

const { resolveLogoUrl, toLogoUrl } = require('..')
const { LOGO_URL } = require('./helpers')

const runServer = async (t, handler) => {
  const server = createServer(handler)
  const url = await listen(server, { port: 0, host: '127.0.0.1' })
  t.teardown(() => promisify(server.close.bind(server))())
  return url.toString()
}

const runSvgServer = t =>
  runServer(t, (_, res) => {
    res.writeHead(200, { 'content-type': 'image/svg+xml' })
    res.end('<svg xmlns="http://www.w3.org/2000/svg" />')
  })

const response = ({
  contentType = 'image/svg+xml',
  statusCode = 200,
  url = LOGO_URL
} = {}) => ({
  statusCode,
  url,
  headers: contentType ? { 'content-type': contentType } : {}
})

test('resolve when the logo is a reachable SVG', t => {
  t.is(toLogoUrl(response()), LOGO_URL)
})

test('resolve when the content type declares a charset', t => {
  t.is(
    toLogoUrl(response({ contentType: 'image/svg+xml;charset=utf-8' })),
    LOGO_URL
  )
})

test('return undefined when the logo is not reachable', t => {
  t.is(toLogoUrl(response({ statusCode: 404 })), undefined)
})

test('return undefined when the logo is not a SVG', t => {
  t.is(toLogoUrl(response({ contentType: 'image/png' })), undefined)
})

test('return undefined when the content type is missing', t => {
  t.is(toLogoUrl(response({ contentType: null })), undefined)
})

test('return undefined when a redirect downgrades the logo to http', t => {
  t.is(
    toLogoUrl(response({ url: 'http://cdn.microlink.io/logo/logo.svg' })),
    undefined
  )
})

test('report the URL a redirect lands on, not the one requested', async t => {
  const target = await runSvgServer(t)

  const source = await runServer(t, (_, res) => {
    res.writeHead(302, { location: `${target}logo.svg` })
    res.end()
  })

  const redirected = await reachableUrl(`${source}logo.svg`)

  t.is(redirected.url, `${target}logo.svg`)
  t.is(toLogoUrl(redirected), undefined)
})

test('return undefined when the logo is not served over https', async t => {
  const url = await runSvgServer(t)

  t.is(await resolveLogoUrl(`${url}logo.svg`), undefined)
})

test('return undefined when the logo cannot be fetched', async t => {
  t.is(
    await resolveLogoUrl('https://127.0.0.1:1/logo.svg', { retry: 0 }),
    undefined
  )
})
