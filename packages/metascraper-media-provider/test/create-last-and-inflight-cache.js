'use strict'

const test = require('ava')

const createLastAndInFlightCache = require('../src/create-last-and-inflight-cache')

test('dedupe in-flight requests for same key', async t => {
  const calls = []
  const fn = createLastAndInFlightCache(async key => {
    const { promise, resolve } = Promise.withResolvers()
    calls.push({ key, resolve })
    return promise
  })

  const first = fn('a')
  const second = fn('a')

  t.is(first, second)

  await Promise.resolve()

  t.is(calls.length, 1)

  calls[0].resolve('value-a')
  const value = await first

  t.is(value, 'value-a')
})

test('reuse last settled value for same key', async t => {
  let count = 0
  const fn = createLastAndInFlightCache(async () => {
    count += 1
    return `value-${count}`
  })

  const first = await fn('a')
  const second = await fn('a')

  t.is(first, 'value-1')
  t.is(second, 'value-1')
  t.is(count, 1)
})

test('clear in-flight entry on rejection', async t => {
  let count = 0
  const fn = createLastAndInFlightCache(async () => {
    count += 1
    if (count === 1) throw new Error('boom')
    return 'ok'
  })

  await t.throwsAsync(() => fn('a'), { message: 'boom' })
  const value = await fn('a')

  t.is(value, 'ok')
  t.is(count, 2)
})
