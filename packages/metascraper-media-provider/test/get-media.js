'use strict'

const test = require('ava')

const createGetMedia = require('../src/get-media')
const { getMedia } = require('../src/get-media')

test('retry count increments for each attempt', async t => {
  const retryCounts = []
  const callTimeouts = []

  const result = await getMedia({
    targetUrl: 'https://example.com/watch',
    retry: 2,
    timeout: 1000,
    props: {},
    getArgs: async ({ url, retryCount, flags }) => {
      retryCounts.push(retryCount)
      return { url, flags }
    },
    run: async (_url, _flags, opts) => {
      callTimeouts.push(opts.timeout)
      const error = new Error('boom')
      error.stderr = 'temporary network error'
      throw error
    }
  })

  t.deepEqual(result, {})
  t.deepEqual(retryCounts, [0, 1, 2])
  t.is(callTimeouts.length, 3)
})

test('stop retrying when URL is unsupported for non-youtube domains', async t => {
  const retryCounts = []

  const result = await getMedia({
    targetUrl: 'https://example.com/watch',
    retry: 10,
    timeout: 1000,
    props: {},
    getArgs: async ({ url, retryCount, flags }) => {
      retryCounts.push(retryCount)
      return { url, flags }
    },
    run: async () => {
      const error = new Error('unsupported')
      error.stderr = 'Unsupported URL'
      throw error
    }
  })

  t.deepEqual(result, {})
  t.deepEqual(retryCounts, [0])
})

test('keep retrying youtube unsupported errors until retry limit', async t => {
  const retryCounts = []

  const result = await getMedia({
    targetUrl: 'https://www.youtube.com/watch?v=123',
    retry: 1,
    timeout: 1000,
    props: {},
    getArgs: async ({ url, retryCount, flags }) => {
      retryCounts.push(retryCount)
      return { url, flags }
    },
    run: async () => {
      const error = new Error('unsupported')
      error.stderr = 'Unsupported URL'
      throw error
    }
  })

  t.deepEqual(result, {})
  t.deepEqual(retryCounts, [0, 1])
})

test('dedupe in-flight requests per url under interleaved calls', async t => {
  const calls = []

  const getMediaByUrl = createGetMedia({
    retry: 0,
    timeout: 1000,
    args: ({ url, flags }) => ({ url, flags }),
    run: async url => {
      const { promise, resolve } = Promise.withResolvers()
      const call = { url, id: calls.length + 1, resolve }
      calls.push(call)
      return promise
    }
  })

  const aUrl = 'https://example.com/a'
  const bUrl = 'https://example.com/b'

  const aOnePromise = getMediaByUrl(aUrl)
  const bOnePromise = getMediaByUrl(bUrl)
  const aTwoPromise = getMediaByUrl(aUrl)

  t.is(aOnePromise, aTwoPromise)

  await Promise.resolve()
  await Promise.resolve()

  t.is(calls.filter(call => call.url === aUrl).length, 1)
  t.is(calls.filter(call => call.url === bUrl).length, 1)

  for (const call of calls) {
    call.resolve({ id: call.id, url: call.url })
  }

  const [aOne, bOne, aTwo] = await Promise.all([
    aOnePromise,
    bOnePromise,
    aTwoPromise
  ])

  t.is(aOne.id, aTwo.id)
  t.not(aOne.id, bOne.id)
})
