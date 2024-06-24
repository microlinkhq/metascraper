'use strict'

const test = require('ava')

const createMetascraper = require('../..')
const titleRules = require('metascraper-title')()
const { load } = require('cheerio')

test('`url` is required', async t => {
  t.plan(9)
  const metascraper = createMetascraper([titleRules])
  try {
    await metascraper()
  } catch (err) {
    t.is(err.name, 'MetascraperError')
    t.is(err.code, 'INVALID_URL')
    t.is(err.message, 'INVALID_URL, Need to provide a valid URL.')
  }
  try {
    await metascraper({ url: '' })
  } catch (err) {
    t.is(err.name, 'MetascraperError')
    t.is(err.code, 'INVALID_URL')
    t.is(err.message, 'INVALID_URL, Need to provide a valid URL.')
  }
  try {
    await metascraper({ url: '/foo' })
  } catch (err) {
    t.is(err.name, 'MetascraperError')
    t.is(err.code, 'INVALID_URL')
    t.is(err.message, 'INVALID_URL, Need to provide a valid URL.')
  }
})

test('passing `{ validateUrl: false }`', async t => {
  const metascraper = createMetascraper([titleRules])

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="Document"/>
  </head>
  <body>
    <div class="logos">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
    </div>

    <img class="main-logo" href="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  const metadata = await metascraper({
    url: 'example.com',
    validateUrl: false,
    html
  })

  t.is(metadata.title, 'Document')
})

test('passing `rules`', async t => {
  const url = 'https://microlink.io'

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div class="logos">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
    </div>

    <img class="main-logo" href="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  const rules = [
    {
      foo: [() => 'bar', () => 'barz'],
      barz: [() => 'foo', () => 'foorz']
    }
  ]

  const metascraper = createMetascraper([titleRules])
  const metadata = await metascraper({ url, html, rules })
  t.is(metadata.foo, 'bar')
})

test('skip `rules` via `test` function', async t => {
  const url = 'https://microlink.io'

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div class="logos">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
    </div>

    <img class="main-logo" href="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  let isCalled = false

  function test ({ url: urlBase }) {
    isCalled = true
    return urlBase !== url
  }

  const rulesBundle = () => {
    const rules = { foo: [() => 'bar'] }
    rules.test = test
    return rules
  }

  const metascraper = createMetascraper([rulesBundle()])
  const metadata = await metascraper({ url, html })
  t.is(metadata.foo, null)
  t.true(isCalled)
})

test('passing `htmlDom`', async t => {
  const url = 'https://microlink.io'
  const htmlDom = load('<title>htmlDom</title>')
  const html = '<title>Original HTML</title>'
  const metascraper = createMetascraper([titleRules])
  const metadata = await metascraper({ url, htmlDom, html })
  t.is(metadata.title, 'htmlDom')
})
