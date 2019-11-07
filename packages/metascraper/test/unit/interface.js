'use strict'

const should = require('should')

const createMetascraper = require('../..')
const titleRules = require('metascraper-title')()

it('url is required', async () => {
  const metascraper = createMetascraper([titleRules])
  try {
    await metascraper()
  } catch (err) {
    should(err.name).be.equal('MetascraperError')
    should(err.code).be.equal('INVALID_URL')
    should(err.message).be.equal('INVALID_URL, Need to provide a valid URL.')
  }
  try {
    await metascraper({ url: '' })
  } catch (err) {
    should(err.name).be.equal('MetascraperError')
    should(err.code).be.equal('INVALID_URL')
    should(err.message).be.equal('INVALID_URL, Need to provide a valid URL.')
  }
  try {
    await metascraper({ url: '/foo' })
  } catch (err) {
    should(err.name).be.equal('MetascraperError')
    should(err.code).be.equal('INVALID_URL')
    should(err.message).be.equal('INVALID_URL, Need to provide a valid URL.')
  }
})

it('escape is enabled by default', async () => {
  const html = `
  <!doctype html>
  <html xmlns:og="http://ogp.me/ns#" lang="en">

  <head>
      <meta charset="utf8">
      <title>metascraper</title>
      <meta property="og:description" content="The HR startups go to war.">
      <meta property="og:image" content="image">
      <meta property="og:title" content="<script src='http://127.0.0.1:8080/malware.js'></script>">
      <meta property="og:type" content="article">
      <meta property="og:url" content="http://127.0.0.1:8080">
  </head>

  <body>
  </body>
  </html>
  `
  const metascraper = createMetascraper([titleRules])
  const metadata = await metascraper({
    html,
    url: 'http://127.0.0.1:8080'
  })

  should(metadata.title).be.equal(
    '&lt;script src=‘http://127.0.0.1:8080/malware.js’&gt;&lt;/script&gt;'
  )
})

it('load extra rules', async () => {
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
  const meta = await metascraper({ url, html, rules })
  should(meta.foo).equal('bar')
})

it('associate test function with rules', async () => {
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

  const rulesBundle = () => {
    const rules = { foo: [() => 'bar'] }
    rules.test = ({ url: urlBase }) => urlBase !== url
    return rules
  }

  const metascraper = createMetascraper([rulesBundle()])
  const meta = await metascraper({ url, html })
  should(meta.foo).be.null()
})
