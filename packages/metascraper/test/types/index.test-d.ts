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

/* validate on rules bundle */

createMetascraper([
  {
    logo: [() => 'https://example.com/a.png'],
    validate: value => value.startsWith('https://')
  }
])

createMetascraper([
  {
    logo: [
      Object.assign(() => 'https://example.com/a.png', {
        validate: async (value: string, { url }: { url: string }) =>
          value !== url
      })
    ]
  }
])

createMetascraper([
  {
    logo: [() => 'https://example.com/a.png'],
    validate: (value, { url }, debug) => {
      if (value !== url) return true
      if (debug.enabled) debug('logo:rejected', { url, reason: 'same-as-url' })
      return false
    }
  }
])
