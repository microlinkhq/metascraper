'use strict'

const test = require('ava')

const { isUrl } = require('../..')

test('true', t => {
  t.true(isUrl('/foo', { relative: true }))
  t.true(isUrl('//cdn.microlink.io/banner.png', { relative: true }))
})

test('false', t => {
  t.false(isUrl('https://example.com/foo', { relative: true }))
  t.false(isUrl('data:image/svg+xml,%', { relative: true }))
})
