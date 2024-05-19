'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://x.com/realDonaldTrump/status/1222907250383245320'))
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})
