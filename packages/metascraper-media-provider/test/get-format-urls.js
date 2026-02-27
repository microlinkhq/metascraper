'use strict'

const test = require('ava')

const { getFormatUrls } = require('../src')

const getFormatUrl = getFormatUrls(() => [() => true], { orderBy: 'tbr' })

test('keep last format when orderBy values tie', t => {
  const input = {
    formats: [
      { tbr: 128, url: 'https://example.com/first.mp4' },
      { tbr: 128, url: 'https://example.com/second.mp4' }
    ]
  }

  const value = getFormatUrl(input, [], { isStream: false })
  t.is(value, 'https://example.com/second.mp4')
})

test('keep undefined orderBy values at the end of ascending selection', t => {
  const input = {
    formats: [
      { tbr: 128, url: 'https://example.com/with-tbr.mp4' },
      { tbr: undefined, url: 'https://example.com/without-tbr.mp4' }
    ]
  }

  const value = getFormatUrl(input, [], { isStream: false })
  t.is(value, 'https://example.com/without-tbr.mp4')
})
