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

test('pick rules by `pickPropNames`', async t => {
  const rulesNames = ['author', 'title', 'image', 'description', 'content']

  const rules = rulesNames.reduce((acc, field) => {
    acc[field] = [() => field]
    return acc
  }, {})

  const metascraper = createMetascraper([rules])
  const url = 'https://example.com'
  const metadata = await metascraper({
    url,
    pickPropNames: new Set(['author', 'title']),
    omitPropNames: new Set(['audio', 'video'])
  })

  t.deepEqual(Object.keys(metadata), ['author', 'title'])
})

test('avoid to run rules by `omitPropNames`', async t => {
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
  const metadata = await metascraper({
    url,
    omitPropNames: new Set(['author'])
  })

  t.deepEqual(
    Object.keys(metadata),
    rulesNames.filter(field => field !== 'author')
  )
})
