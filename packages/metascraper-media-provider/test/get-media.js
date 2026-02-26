'use strict'

const test = require('ava')

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
