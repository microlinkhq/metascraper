'use strict'

const test = require('ava')

const { parseSize } = require('..')

test('parse value properly', t => {
  t.is(parseSize('12x12'), 12)
  t.is(parseSize('12'), 12)
  t.is(parseSize('12x'), 12)
  t.is(parseSize(12), 12)
  t.is(parseSize(''), 0)
  t.is(parseSize(null), 0)
  t.is(parseSize(undefined), 0)
  t.is(parseSize('random'), 0)
  t.is(parseSize(NaN), 0)
})
