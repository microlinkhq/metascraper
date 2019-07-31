'use strict'

const snapshot = require('snap-shot')

const createMetascraperClearbit = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-clearbit', () => {
  it('returns returns logo url if it exists', async () => {
    const metascraper = createMetascraper([createMetascraperClearbit()])
    const url = 'https://microlink.io'
    const meta = await metascraper({ url })
    snapshot(meta)
  })

  it('returns null if no logo available', async () => {
    const metascraper = createMetascraper([createMetascraperClearbit()])
    const url = 'https://lolwerhere.com'
    const meta = await metascraper({ url })
    snapshot(meta)
  })

  it('accept `gotOpts` options', async () => {
    const metascraper = createMetascraper([
      createMetascraperClearbit({
        gotOpts: {
          timeout: 1
        }
      })
    ])
    const url = 'https://microlink.io'
    const meta = await metascraper({ url })
    snapshot(meta)
  })

  it('accept `logoOpts` options', async () => {
    const metascraper = createMetascraper([
      createMetascraperClearbit({
        gotOpts: {
          timeout: 5000
        },
        logoOpts: {
          format: 'jpg',
          greyscale: true
        }
      })
    ])
    const url = 'https://microlink.io'
    const meta = await metascraper({ url })
    snapshot(meta)
  })
})
