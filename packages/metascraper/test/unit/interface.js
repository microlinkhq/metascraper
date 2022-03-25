'use strict'

const should = require('should')

const createMetascraper = require('../..')
const titleRules = require('metascraper-title')()

it('`url` is required', async () => {
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

it('Disable URL validation using `validateUrl`', async () => {
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

  should(metadata.title).equal('Document')
})

it('load extra `rules`', async () => {
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
  should(metadata.foo).equal('bar')
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
  should(metadata.foo).be.null()
  should(isCalled).be.true()
})
