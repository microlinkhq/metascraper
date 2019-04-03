'use strict'

const should = require('should')

it("add a new rule from a prop that doesn't exist", async () => {
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

  const metascraper = require('../..')([])
  const meta = await metascraper({ url, html, rules })
  should(meta.foo).be.equal('bar')
})

it('add a new rule for a prop that exists', async () => {
  const url = 'https://microlink.io'

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:image" content="http://ia.media-imdb.com/images/rock.jpg" />
    <title>Document</title>
  </head>
  <body>
    <img id="logo" src="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  const rules = [
    {
      image: [({ htmlDom: $ }) => $('#logo').attr('src')]
    }
  ]

  const metascraper = require('../..')([require('metascraper-image')()])

  const meta = await metascraper({ url, html, rules })
  should(meta.image).be.equal('https://microlink.io/logo.png')
})
