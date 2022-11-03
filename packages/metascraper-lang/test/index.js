'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('metascraper')([require('..')()])

test('html lang property', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/html-lang.html'))
  const url =
    'http://www.dwutygodnik.com/artykul/7615-churchill-bohater-naszych-czasow.html'
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
