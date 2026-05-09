'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('../../..')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-audio')(),
  require('metascraper-video')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-manifest')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')()
])

const url =
  'https://www.hola.com/us/celebrities/20240624701307/rauw-alejandro-bruna-marquezine-dreams-to-accomplish/'

test('hola', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, null)
  t.is(metadata.author, 'Daniel Neira')
  t.is(metadata.date, '2024-06-24T20:23:34.721Z')
  t.true(metadata.description.includes('She is gorgeous'))
  t.true(
    metadata.image.startsWith('https://www.hola.com/us/horizon/landscape/')
  )
  t.is(metadata.lang, 'en')
  t.is(metadata.logo, 'https://www.hola.com/us/favicon-192x192.png')
  t.is(metadata.publisher.toLowerCase(), 'hola! us')
  t.is(
    metadata.title,
    'Rauw Alejandro and Bruna Marquezine on the dreams they want to accomplish: ‘To have kids and a serene love’'
  )
  t.is(metadata.url, url)
  t.is(metadata.video, null)
})
