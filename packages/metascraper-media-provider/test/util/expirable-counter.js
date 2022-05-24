'use strict'

const test = require('ava')

const { expirableCounter } = require('../../src/get-media/util')

const TEN_MIN_MS = 10 * 60 * 1000
const EXPIRATION_DELAY = 500

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('increment and access the value', t => {
  const counter = expirableCounter(0, TEN_MIN_MS)
  t.is(counter.val(), 0)
  t.is(counter.incr(), 1)
  t.is(counter.incr(), 2)
  t.is(counter.val(), 2)
})

test('reset after ttl', async t => {
  const counter = expirableCounter(0, EXPIRATION_DELAY)
  t.is(counter.incr(), 1)
  t.is(counter.incr(), 2)
  t.is(counter.val(), 2)

  await delay(EXPIRATION_DELAY)

  t.is(counter.val(), 0)
  t.is(counter.incr(), 1)
})
