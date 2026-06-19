'use strict'

// Isolated in its own file: the extractor memoizes a single result keyed by its
// arguments, so a colliding call from another concurrent test would mask the
// behaviour under test. A dedicated process keeps these two calls deterministic.
const test = require('ava').default
const path = require('path')
const fs = require('fs')

const metascraperDefuddle = require('metascraper-defuddle')

test('re-extracts when options differ for the same html', async t => {
  const url = 'https://example.com/article'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/article.html'),
    'utf-8'
  )

  const calls = []
  await metascraperDefuddle.defuddleExtract(url, html, {
    preprocess: () => calls.push('first')
  })
  await metascraperDefuddle.defuddleExtract(url, html, {
    preprocess: () => calls.push('second')
  })

  t.deepEqual(calls, ['first', 'second'])
})
