'use strict'

const test = require('ava').default

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://www.pinterest.com/ballerbig681/'))
  t.true(validator('https://pinterest.com/ballerbig681/'))
  t.true(validator('https://www.pinterest.co.uk/ballerbig681/'))
})

test('false', t => {
  t.false(validator('https://example.com/ballerbig681/'))
  t.false(validator('https://pinterest.evil.com/ballerbig681/'))
  t.false(validator('https://notpinterest.com/ballerbig681/'))
})
