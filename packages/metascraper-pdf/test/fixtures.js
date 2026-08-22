'use strict'

const { existsSync, readFileSync } = require('fs')
const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

const FIXTURES = resolve(__dirname, 'fixtures')
const skipReason = existsSync(resolve(FIXTURES, '1.pdf'))
  ? null
  : 'PDF fixtures missing; run test/fixtures/download.sh'

const urls = existsSync(resolve(FIXTURES, 'urls.txt'))
  ? readFileSync(resolve(FIXTURES, 'urls.txt'), 'utf8').trim().split('\n')
  : []

const getPdf = async url => {
  const index = urls.indexOf(url)
  return readFile(resolve(FIXTURES, `${index + 1}.pdf`))
}

const metascraper = require('metascraper')([require('..')({ getPdf })])

const summarize = metadata => {
  const compact = value =>
    typeof value === 'string' && value.startsWith('data:')
      ? `${value.slice(0, 21)}…${value.length}`
      : value
  return {
    ...metadata,
    image: compact(metadata.image),
    logo: compact(metadata.logo)
  }
}

for (const url of urls) {
  test(url, async t => {
    if (skipReason) return t.pass()
    t.snapshot(summarize(await metascraper({ url })))
  })
}
