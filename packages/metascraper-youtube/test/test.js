'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://www.youtube.com/watch?v=hwMkbaS_M_c'))
  t.true(validator('https://www.youtube.com/watch?v=GDRd-BFTYIg'))
  t.true(validator('https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'))
  t.true(validator('https://www.youtube.com/watch?v=rXyKq7izYCQ'))
})
test('false', t => {
  t.false(validator('https://microlink.io'))
  t.false(validator('https://kikobeats.com'))
})
