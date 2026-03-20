'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')

const metascraper = require('metascraper')([require('metascraper-defuddle')()])
const metascraperDefuddle = require('metascraper-defuddle')

test('extracts metadata from article HTML', async t => {
  const url = 'https://example.com/article'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/article.html'),
    'utf-8'
  )

  const metadata = await metascraper({ html, url })
  t.truthy(metadata.title)
  t.true(metadata.title.includes('Test Article'))
  t.truthy(metadata.description)
  t.truthy(metadata.author)
  t.is(metadata.lang, 'en')
  t.is(metadata.date, null)
  t.truthy(metadata.publisher)
})

test('exposes package name in rules bundle', t => {
  const rules = metascraperDefuddle()
  t.is(rules.pkgName, 'metascraper-defuddle')
})

test('serializes html once per invocation', async t => {
  const url = 'https://example.com/article'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/article.html'),
    'utf-8'
  )

  const { load } = require('cheerio')
  const $ = load(html, { baseURI: url })
  const originalHtml = $.html.bind($)
  let htmlCalls = 0

  $.html = (...args) => {
    if (args.length === 0) htmlCalls++
    return originalHtml(...args)
  }

  await metascraper({ htmlDom: $, url })
  t.is(htmlCalls, 1)
})

test('handles malformed HTML without throwing', async t => {
  const url = 'https://example.com/malformed'
  const html = '<html lang="en"><head><title>Malformed Test'

  const metadata = await metascraper({ html, url })
  t.is(typeof metadata, 'object')
  t.is(metadata.lang, 'en')
})
