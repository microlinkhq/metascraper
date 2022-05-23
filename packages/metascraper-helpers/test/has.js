'use strict'

const test = require('ava')

const { has } = require('..')

test('true', t => {
  t.true(has(true))
  t.true(has(0))
  t.true(has(null))
  t.true(has('foo'))
  t.true(has(123))
  t.true(has(['foo']))
  t.true(has({ foo: 'bar' }))
  t.true(has(false))
})

test('false', t => {
  t.false(has(''))
  t.false(has(undefined))
  t.false(has({}))
  t.false(has([]))
  t.false(has(NaN))
})
