'use strict'

const test = require('ava').default

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://www.imdb.com/title/tt0091042/'))
  t.true(validator('https://imdb.com/title/tt0091042/'))
  t.true(validator('https://m.imdb.com/title/tt0091042/'))
  t.true(validator('https://www.imdb.com/name/nm0000111/'))
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
  t.false(validator('https://www.rottentomatoes.com/m/ferris_buellers_day_off'))
  t.false(validator('https://imdb.evil.com/title/tt0091042/'))
  t.false(validator('https://notimdb.com/title/tt0091042/'))
})
