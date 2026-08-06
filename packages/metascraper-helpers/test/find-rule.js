'use strict'

const test = require('ava').default

const { findRule } = require('../src')

const withValidate = (fn, validate) => Object.assign(fn, { validate })

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
    await findRule([
      withValidate(
        () => 'bad',
        v => v === 'good'
      ),
      withValidate(
        () => 'good',
        v => v === 'good'
      )
    ]),
    'good'
  )
})

test('validate rejecting every rule returns undefined', async t => {
  t.is(
    await findRule([
      withValidate(
        () => 'a',
        () => false
      ),
      withValidate(
        () => 'b',
        () => false
      )
    ]),
    undefined
  )
})

test('a throwing validate rejects only that candidate', async t => {
  const value = await findRule([
    withValidate(
      () => 'a',
      v => {
        if (v === 'a') throw new Error('boom')
      }
    ),
    withValidate(
      () => 'b',
      () => true
    )
  ])

  t.is(value, 'b')
})

test('rules without validate are unchanged', async t => {
  t.is(await findRule([() => 'value']), 'value')
})
