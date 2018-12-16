'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const fs = require('fs')

const metascraper = require('metascraper')([require('..')()])

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
