import createMetascraper from '../../src'

/* basic */

createMetascraper([])

createMetascraper([
  require('metascraper-author')(),
  require('metascraper-url')()
])

/* methods */

const metascraper = createMetascraper([
  require('metascraper-author')(),
  require('metascraper-url')()
])

const payload = await metascraper({
  url: 'https://example.com',
  html: '',
  validateUrl: false
})

console.log(payload.author)

/* scrape-level validate */

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: value => value.startsWith('https://')
})

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: async (value: string, { url }: { url: string }) => value !== url
})

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: (value, { url }, debug) => {
    if (value !== url) return true
    if (debug.enabled) debug('logo:rejected', { url, reason: 'same-as-url' })
    return false
  }
})
