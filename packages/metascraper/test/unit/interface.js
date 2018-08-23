'use strict'

const should = require('should')

const metascraper = require('../..')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-video')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

it('url is required', async () => {
  try {
    await metascraper()
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})

it('html is required', async () => {
  try {
    await metascraper({ url: 'https://foo.com' })
  } catch (err) {
    should(err).instanceof(TypeError)
  }
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
      foo: [() => 'bar']
    }
  ]

  const meta = await metascraper({ url, html, rules })
  should(meta.foo).equal('bar')
})

it('core bundle rules expose validator', () => {
  const rules = [
    require('metascraper-author'),
    require('metascraper-date'),
    require('metascraper-description'),
    require('metascraper-image'),
    require('metascraper-title'),
    require('metascraper-url'),
    require('metascraper-lang'),
    require('metascraper-logo'),
    require('metascraper-video'),
    require('metascraper-publisher')
  ]

  rules.forEach(rule => {
    should(rule.validator).be.type('function')
  })
})
