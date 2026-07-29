'use strict'

const reachableUrl = require('reachable-url')
const test = require('ava').default

const { resolveLogoUrl, toLogoUrl } = require('..')
const { LOGO_URL, runServer } = require('./helpers')

const runSvgServer = t =>
  runServer(t, ({ res }) => {
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
  t.is(toLogoUrl(response({ statusCode: 500 })), undefined)
})

test('return undefined when the logo is not a SVG', t => {
  t.is(toLogoUrl(response({ contentType: 'text/html' })), undefined)
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

/**
 * What `toLogoUrl` inspects is the URL a redirect landed on, not the one the
 * record published, which is why the https check cannot stop at `parseRecord`.
 */
test('report the URL a redirect lands on, not the one requested', async t => {
  const target = await runSvgServer(t)

  const source = await runServer(t, ({ res }) => {
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

test('return undefined when the host does not exist', async t => {
  t.is(await resolveLogoUrl('https://idontexist.lol/logo.svg'), undefined)
})
