'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})

test('false', t => {
  t.false(validator('https://www.instagram.com/p/CPeC-Eenc8l/'))
})
