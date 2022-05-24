'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getOembedUrl } = require('../src/from-html')

test('detect from `application/json+oembed`', t => {
  const url = 'https://example.com'
  const oembedUrl = 'https://example.com'
  const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="application/json+oembed" href="${oembedUrl}"></head>
        <body></body>
      </html>
      `
  const jsonUrl = getOembedUrl(url, cheerio.load(html))
  t.is(jsonUrl, `${oembedUrl}/`)
})

test('detect oEmbed URL from `text/xml+oembed`', t => {
  const url = 'https://example.com/'
  const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="text/xml+oembed" href="${url}"></head>
        <body></body>
      </html>
      `
  const jsonUrl = getOembedUrl(url, cheerio.load(html))
  t.is(jsonUrl, url)
})

test('ensure output URL is absolute', t => {
  const oembedUrl = '/wp-json/oembed.js'
  const url = 'https://example.com'
  const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="text/xml+oembed" href="${oembedUrl}"></head>
        <body></body>
      </html>
      `
  const jsonUrl = getOembedUrl(url, cheerio.load(html))
  t.is(jsonUrl, `${url}${oembedUrl}`)
})
