'use strict'

const snapshot = require('snap-shot')

const createMetascraperClearbit = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-clearbit', () => {
  describe('options', () => {
    it('gotOpts', async () => {
      const metascraper = createMetascraper([
        createMetascraperClearbit({
          gotOpts: {
            timeout: 1
          }
        })
      ])
      const url = 'https://microlink.io'
      const metadata = await metascraper({ url })
      snapshot(metadata)
    })

    it('logoOpts', async () => {
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
      const metadata = await metascraper({ url })
      snapshot(metadata)
    })
  })

  it('returns returns logo url if it exists', async () => {
    const metascraper = createMetascraper([createMetascraperClearbit()])
    const url = 'https://microlink.io'
    const metadata = await metascraper({ url })
    snapshot(metadata)
  })

  it('returns null if no logo available', async () => {
    const metascraper = createMetascraper([createMetascraperClearbit()])
    const url = 'https://lolwerhere.com'
    const metadata = await metascraper({ url })
    snapshot(metadata)
  })
})
