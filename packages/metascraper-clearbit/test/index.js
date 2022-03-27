'use strict'

const snapshot = require('snap-shot')
const should = require('should')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

describe('metascraper-clearbit', () => {
  describe('options', () => {
    it('keyvOpts', async () => {
      const cache = new Map()
      const metascraper = createMetascraper({ keyvOpts: { store: cache } })

      const metadataOne = await metascraper({ url: 'https://microlink.io' })
      should(metadataOne.logo).be.not.null()
      should(metadataOne.publisher).be.not.null()
      should(cache.size).be.equal(1)

      const metadataTwo = await metascraper({ url: 'https://lolwerhere.com' })
      should(metadataTwo.logo).be.null()
      should(metadataTwo.publisher).be.null()
      should(cache.size).be.equal(2)
    })

    it('logoOpts', async () => {
      const metascraper = createMetascraper({
        gotOpts: {
          timeout: 5000
        },
        logoOpts: {
          format: 'jpg',
          greyscale: true
        }
      })
      const url = 'https://microlink.io'
      const metadata = await metascraper({ url })
      snapshot(metadata)
    })
  })

  it('works fine with subdomains', async () => {
    const metascraper = createMetascraper()
    const url = 'https://www.youtube.com/watch?v=jcFZfcxs85o'
    const metadata = await metascraper({ url })
    snapshot(metadata)
  })

  it('returns logo url if it exists', async () => {
    const metascraper = createMetascraper()
    const url = 'https://microlink.io'
    const metadata = await metascraper({ url })
    snapshot(metadata)
  })

  it('returns null if no logo available', async () => {
    const metascraper = createMetascraper()
    const url = 'https://lolwerhere.com'
    const metadata = await metascraper({ url })
    snapshot(metadata)
  })
})
