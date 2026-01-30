'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://www.instagram.com/p/CPeC-Eenc8l/'))
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})
