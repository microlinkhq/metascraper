'use strict'

const path = require('path')

const test = require('ava').default

const createMetascraper = require('../..')
const debug = require(require.resolve('debug', {
  paths: [path.dirname(require.resolve('debug-logfmt'))]
}))

const withGetDataLogs = async fn => {
  const previous = debug.disable()
  debug.enable('metascraper:get-data')
  const chunks = []
  const write = process.stderr.write
  process.stderr.write = (chunk, encoding, cb) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk))
    return write.call(process.stderr, chunk, encoding, cb)
  }
  try {
    await fn()
    return chunks.join('')
  } finally {
    process.stderr.write = write
    debug.disable()
    if (previous) debug.enable(previous)
  }
}

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

test('a rule value without a string form is returned as is', async t => {
  const location = Object.assign(Object.create(null), {
    href: 'https://example.com/'
  })
  const cyclic = { name: 'cyclic' }
  cyclic.self = cyclic
  const customInspect = {
    name: 'custom',
    [Symbol.for('nodejs.util.inspect.custom')]: () => {
      throw new Error('custom')
    }
  }
  const revoked = Proxy.revocable({}, {})
  revoked.revoke()
  const symbol = Symbol('value')
  const bareFunction = Object.setPrototypeOf(() => {}, null)

  const metascraper = createMetascraper([
    {
      location: [() => location],
      cyclic: [() => cyclic],
      customInspect: [() => customInspect],
      revoked: [() => revoked.proxy],
      symbol: [() => symbol],
      bareFunction: [() => bareFunction],
      title: [() => 'title']
    }
  ])
  const metadata = await metascraper({ url: 'https://example.com' })

  t.is(metadata.location, location)
  t.is(metadata.cyclic, cyclic)
  t.is(metadata.customInspect, customInspect)
  t.is(metadata.revoked, null)
  t.is(metadata.symbol, symbol)
  t.is(metadata.bareFunction, bareFunction)
  t.is(metadata.title, 'title')
})

test.serial(
  'logs a primitive rule value and the type of any other',
  async t => {
    const location = Object.assign(Object.create(null), {
      href: 'https://example.com/'
    })
    const symbol = Symbol('value')
    const bareFunction = Object.setPrototypeOf(() => {}, null)
    const metascraper = createMetascraper([
      {
        label: [() => 'hello'],
        count: [() => 0],
        flag: [() => false],
        big: [() => 10n],
        empty: [() => null],
        location: [() => location],
        symbol: [() => symbol],
        bareFunction: [() => bareFunction]
      }
    ])

    let metadata
    const log = await withGetDataLogs(async () => {
      metadata = await metascraper({ url: 'https://example.com' })
    })

    t.is(metadata.label, 'hello')
    t.is(metadata.count, 0)
    t.is(metadata.flag, false)
    t.is(metadata.big, 10n)
    t.is(metadata.empty, null)
    t.is(metadata.location, location)
    t.is(metadata.symbol, symbol)
    t.is(metadata.bareFunction, bareFunction)
    t.regex(log, /label=hello rules=/)
    t.regex(log, /count=0 rules=/)
    t.regex(log, /flag=false rules=/)
    t.regex(log, /big=10 rules=/)
    t.regex(log, /empty=null rules=/)
    t.regex(log, /location=object rules=/)
    t.regex(log, /symbol=symbol rules=/)
    t.regex(log, /bareFunction=function rules=/)
  }
)
