'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://t.me/teslahunt'))
  t.true(validator('https://t.me/teslahunt/2351'))
  t.true(validator('https://teslahunt.t.me/2351'))
})

test('false', t => {
  t.false(validator('https://t.co/d0rwf2dLIp'))
})
