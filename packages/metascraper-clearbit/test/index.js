'use strict'

const snapshot = require('snap-shot')

const metascraper = require('metascraper')([require('..')()])

describe('metascraper-clearbit', () => {
  it('returns when is possible resolve logo', async () => {
    const url = 'https://facebook.com'
    const meta = await metascraper({ url })
    snapshot(meta)
  })

  it('otherwise returns null', async () => {
    const url = 'https://lolwerhere.com'
    const meta = await metascraper({ url })
    snapshot(meta)
  })
})
