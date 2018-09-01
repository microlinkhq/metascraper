'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const fs = require('fs')

const metascraper = require('metascraper')([
  require('metascraper-amazon')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('..')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const readFile = promisify(fs.readFile)

describe('metascraper-lang', () => {
  it('html lang property', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/html-lang.html'))
    const url =
      'http://www.dwutygodnik.com/artykul/7615-churchill-bohater-naszych-czasow.html'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
