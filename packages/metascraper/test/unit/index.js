'use strict'

const test = require('ava')

const createMetascraper = require('../..')

test('returns all rules fields by default', async t => {
  const rulesNames = [
    'author',
    'title',
    'image',
    'description',
    'content',
    'date',
    'logo',
    'favicon',
    'publisher',
    'audio',
    'video',
    'lang',
    'url'
  ]

  const rules = rulesNames.reduce((acc, field) => {
    acc[field] = [() => field]
    return acc
  }, {})

  const metascraper = createMetascraper([rules])
  const url = 'https://example.com'
  const metadata = await metascraper({ url })

  t.deepEqual(Object.keys(metadata), rulesNames)
})

test('selective rules', async t => {
  const rulesNames = [
    'author',
    'title',
    'image',
    'description',
    'content',
    'date',
    'logo',
    'favicon',
    'publisher',
    'audio',
    'video',
    'lang',
    'url'
  ]

  const rules = rulesNames.reduce((acc, field) => {
    acc[field] = [() => field]
    return acc
  }, {})

  const metascraper = createMetascraper([rules])
  const url = 'https://example.com'
  const metadata = await metascraper({ url, omitProps: new Set(['author']) })

  t.deepEqual(
    Object.keys(metadata),
    rulesNames.filter(field => field !== 'author')
  )
})
