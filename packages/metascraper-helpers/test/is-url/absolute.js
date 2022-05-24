'use strict'

const test = require('ava')

const { isUrl } = require('../..')

test('true', t => {
  t.true(isUrl('https://example.com/foo'))
  t.true(isUrl('https://en.wikipedia.org/wiki/MBK_(Scooter_manufacturer)'))
})
test('false', t => {
  t.false(isUrl('/foo'))
  t.false(isUrl('data:image/svg+xml,%'))
})
