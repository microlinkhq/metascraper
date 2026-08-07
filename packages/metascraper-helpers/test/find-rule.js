'use strict'

const test = require('ava').default

const { findRule } = require('..')

test('args are optional', async t => {
  t.is(await findRule([() => 'value']), 'value')
})

test('rules are evaluated until one produces a value', async t => {
  const calls = []
  const rule = (name, value) => () => {
    calls.push(name)
    return value
  }

  t.is(
    await findRule([rule('first'), rule('second', 'value'), rule('third')]),
    'value'
  )
  t.deepEqual(calls, ['first', 'second'])
})

test('a rule test skips the rule entirely', async t => {
  const skipped = Object.assign(() => 'skipped', { test: () => false })
  t.is(await findRule([skipped, () => 'value']), 'value')
})

test('validate rejects a candidate and resumes at the next rule', async t => {
  t.is(
    await findRule([() => 'bad', () => 'good'], {
      validate: v => v === 'good'
    }),
    'good'
  )
})

test('validate rejecting every rule returns undefined', async t => {
  t.is(
    await findRule([() => 'a', () => 'b'], { validate: () => false }),
    undefined
  )
})

test('a throwing validate rejects only that candidate', async t => {
  const value = await findRule([() => 'a', () => 'b'], {
    validate: v => {
      if (v === 'a') throw new Error('boom')
      return true
    }
  })

  t.is(value, 'b')
})

test('validate receives the find-rule debug logger', async t => {
  let debug
  await findRule([() => 'value'], {
    validate: (value, args, logger) => {
      debug = logger
      return true
    }
  })

  t.is(typeof debug, 'function')
  t.falsy(debug.enabled)
  t.notThrows(() => debug('validate:custom', { reason: 'test' }))
})
