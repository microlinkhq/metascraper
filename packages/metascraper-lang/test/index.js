'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')

const metascraper = require('metascraper')([require('..')()])

describe('metascraper-lang', () => {
  it('html lang property', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/html-lang.html'))
    const url =
      'http://www.dwutygodnik.com/artykul/7615-churchill-bohater-naszych-czasow.html'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
