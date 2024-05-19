'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const cheerio = require('cheerio')
const test = require('ava')

const { commonProviders } = require('./helpers')
const { test: validator } = require('..')

test('true', t => {
  commonProviders.forEach(url => {
    const htmlDom = cheerio.load('')
    t.true(validator(url, htmlDom))
  })
})

test('false', t => {
  ;['https://example.com'].forEach(url => {
    const htmlDom = cheerio.load('')
    t.false(validator(url, htmlDom))
  })
})

test('from markup', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
  const url = 'https://view.genially.com/5dc53cfa759d2a0f4c7db5f4'
  const htmlDom = cheerio.load(html)
  t.true(validator(url, htmlDom))
})
